# -*- coding: utf-8 -*-
#
#  Copyright 2016, 2017 Ramil Nugmanov <stsouko@live.ru>
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
from flask import request
from flask_restful import marshal
from pony.orm import db_session
from .common import (AuthResource, swagger, dynamic_docstring, additives_check, fetch_task, format_results, abort,
                     redis, results_fetch)
from ..structures import TaskPostResponseFields, TaskStructureFields, TaskGetResponseFields
from ...constants import StructureStatus, TaskStatus, ResultType
from ...models import Model, Additive


results_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in ResultType)


class ModelTask(AuthResource):
    @swagger.operation(
        notes='Get modeled task',
        nickname='modeled',
        responseClass=TaskGetResponseFields.__name__,
        parameters=[dict(name='task', description='Task ID', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='page', description='Results pagination', required=False,
                         allowMultiple=False, dataType='int', paramType='query')],
        responseMessages=[dict(code=200, message="modeled task"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this task'),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only validation tasks acceptable'),
                          dict(code=500, message="modeling server error"),
                          dict(code=512, message='task not ready')])
    @dynamic_docstring(results_types_desc)
    def get(self, task):
        """
        Task with results of structures with conditions modeling

        all structures include models with results lists.
        failed models contain empty results lists.

        see also /task/prepare get doc.

        available model results response types: {0}
        """
        page = results_fetch.parse_args().get('page')
        return format_results(task, fetch_task(task, TaskStatus.DONE, page=page)), 200

    @swagger.operation(
        notes='Create modeling task',
        nickname='modeling',
        responseClass=TaskPostResponseFields.__name__,
        parameters=[dict(name='task', description='Task ID', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='structures', description='Conditions and selected models for structure[s]',
                         required=True, allowMultiple=False, dataType=TaskStructureFields.__name__, paramType='body')],
        responseMessages=[dict(code=201, message="modeling task created"),
                          dict(code=400, message="invalid structure data"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this task'),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only validation tasks acceptable'),
                          dict(code=500, message="modeling server error"),
                          dict(code=512, message='task not ready')])
    def post(self, task):
        """
        Modeling task structures and conditions

        send only changed conditions or todelete marks. see task/prepare doc.
        data, status and type fields unusable.
        """
        data = marshal(request.get_json(force=True), TaskStructureFields.resource_fields)
        result = fetch_task(task, TaskStatus.PREPARED)[0]

        prepared = {s['structure']: s for s in result['structures']}
        tmp = {x['structure']: x for x in (data if isinstance(data, list) else [data])}

        if 0 in tmp:
            abort(400, message='invalid structure data')

        with db_session:
            additives = Additive.get_additives_dict()
            models = Model.get_models_dict()

        structures = []
        for s, ps in prepared.items():
            if ps['status'] != StructureStatus.CLEAR:
                continue
            elif s not in tmp:
                if not ps['models']:
                    continue
                ps['models'] = [models[m['model']].copy() for m in ps['models'] if m['model'] in models]
            elif tmp[s]['todelete']:
                continue
            else:
                d = tmp[s]

                if d['additives'] is not None:
                    ps['additives'] = additives_check(d['additives'], additives)

                if d['models'] is not None:
                    ps['models'] = [models[m['model']].copy() for m in d['models'] if m['model'] in models and
                                    models[m['model']]['type'].compatible(ps['type'], result['type'])]
                else:  # recheck models for existing
                    ps['models'] = [models[m['model']].copy() for m in ps['models'] if m['model'] in models]

                if d['temperature']:
                    ps['temperature'] = d['temperature']

                if d['pressure']:
                    ps['pressure'] = d['pressure']

            structures.append(ps)

        if not structures:
            abort(400, message='invalid structure data')

        new_job = redis.new_job(structures, result['user'], result['type'], TaskStatus.MODELING)
        if new_job is None:
            abort(500, message='modeling server error')

        return dict(task=new_job['id'], status=TaskStatus.MODELING.value, type=result['type'].value,
                    date=new_job['created_at'].strftime("%Y-%m-%d %H:%M:%S"), user=result['user']), 201
