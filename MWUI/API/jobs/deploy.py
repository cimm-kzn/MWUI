# -*- coding: utf-8 -*-
#
#  Copyright 2016-2018 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of MWUI.
#
#  MWUI is free software; you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as published by
#  the Free Software Foundation; either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
#  MA 02110-1301, USA.
#
from functools import wraps
from flask import request, Response
from flask_restful import Resource
from pony.orm import db_session, flush
from time import sleep
from .common import redis, request_json_parser
from ..common import abort
from ..structures import ModelRegisterFields
from ...constants import StructureStatus, TaskStatus, UserRole, TaskType, AdditiveType
from ...logins import UserLogin
from ...models import Model, Destination, Additive


def authenticate(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.authorization
        if auth:
            u = UserLogin.get(auth.username.lower(), auth.password)
            if u and u.role_is(UserRole.ADMIN):
                return f(*args, **kwargs)

        return Response('access deny', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})

    return wrapper


class DBAuthResource(Resource):
    method_decorators = [authenticate, db_session]


class RegisterModels(DBAuthResource):
    @request_json_parser(ModelRegisterFields.resource_fields)
    def post(self, data):
        if not isinstance(data, list):
            data = [data]

        available = {x['name']: [(d['host'], d['port'], d['name']) for d in x['destinations']]
                     for x in Model.get_models_dict(skip_prep=False).values()}
        additives = Additive.get_additives_dict(key='name')
        preparer = Model.get_preparer_model()

        report, structures = [], []
        for n, m in enumerate(data, start=1):
            if not m['destinations']:
                continue
            if m['name'] in available:
                tmp = []
                model = Model.get(name=m['name'])
                for d in m['destinations']:
                    if (d['host'], d['port'], d['name']) not in available[m['name']]:
                        tmp.append(Destination(model=model, **d))
                if tmp:
                    report.append(dict(model=model.id, name=model.name, description=model.description,
                                       type=model.type.value,
                                       destinations=[dict(host=x.host, port=x.port, name=x.name) for x in tmp]))
                continue

            d = m['example'].copy()
            if d['data']:
                alist = []
                for a in d['additives'] or []:
                    ai = a['name']
                    if ai in additives and (0 < a['amount'] <= 1 if additives[ai]['type'] == AdditiveType.SOLVENT
                                            else a['amount'] > 0):
                        alist.append(dict(amount=a['amount'], **additives[ai]))
                d.update(structure=n, models=[preparer.copy()], status=StructureStatus.RAW, additives=alist)
                structures.append(d)

        if not (structures or report):
            abort(400, message='invalid example data or models already exists')

        if structures:
            new_job = redis.new_job(structures, 0, TaskType.MODELING, TaskStatus.PREPARING)
            if new_job is None:
                abort(500, message='modeling server error')

            while True:
                sleep(3)
                job = redis.fetch_job(new_job['id'])
                if not job:
                    abort(500, message='modeling server error')
                if job['is_finished']:
                    break

            for x in job['result']['structures']:
                if x['status'] == StructureStatus.CLEAR:
                    m = data[x['structure'] - 1]
                    tmp = []
                    model = Model(type=m['type'], name=m['name'], description=m['description'], example=x)
                    flush()
                    for d in m['destinations']:
                        tmp.append(Destination(model=model, **d))

                    if tmp:
                        report.append(dict(model=model.id, name=model.name, description=model.description,
                                           type=model.type.value,
                                           destinations=[dict(host=x.host, port=x.port, name=x.name) for x in tmp]))
        return report, 201
