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
from flask import url_for
from flask_login import current_user
from flask_restful import reqparse, marshal_with
from flask_restful.inputs import url
from pathlib import Path
from typing import Dict, Tuple
from uuid import uuid4
from werkzeug.datastructures import FileStorage
from .common import redis, additives_check, request_json_parser
from .marshal import TaskPostResponseFields, TaskStructureCreateFields
from ..common import abort, swagger, dynamic_docstring, DBAuthResource, request_arguments_parser
from ...config import UPLOAD_ROOT
from ...constants import StructureStatus, TaskStatus, TaskType, AdditiveType, StructureType
from ...models import Model, Additive


task_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in TaskType)


class CreateTask(DBAuthResource):
    @swagger.operation(
        notes='Create validation task',
        nickname='create',
        responseClass=TaskPostResponseFields.__name__,
        parameters=[dict(name='_type', description='Task type ID: %s' % task_types_desc, required=True,
                         allowMultiple=False, dataType='int', paramType='path'),
                    dict(name='structures', description='Structure[s] of molecule or reaction with optional conditions',
                         required=True, allowMultiple=False, dataType=TaskStructureCreateFields.__name__,
                         paramType='body')],
        responseMessages=[dict(code=201, message="validation task created"),
                          dict(code=400, message="invalid structure data"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message="invalid task type"),
                          dict(code=500, message="modeling server error")])
    @marshal_with(TaskPostResponseFields.resource_fields)
    @request_json_parser(TaskStructureCreateFields.resource_fields)
    @dynamic_docstring(AdditiveType.SOLVENT, TaskStatus.PREPARING,
                       TaskType.MODELING, TaskType.SEARCHING, TaskType.POPULATING)
    def post(self, _type, data):
        """
        Create new task

        possible to send list of TaskStructureFields if task type is {2.value} [{2.name}].
        e.g. [TaskStructureFields1, TaskStructureFields2,...]

        data field is required. field should be a string containing marvin document or cml or smiles/smirks
        additive should be in list of available additives.
        amount should be in range 0 to 1 for additives type = {0.value} [{0.name}], and positive for overs.
        temperature in Kelvin and pressure in Bar also should be positive.

        response include next information:
        date: creation date time
        status: {1.value} [{1.name}]
        task: task id
        type: {2.value} [{2.name}] or {3.value} [{3.name}] or {4.value} [{4.name}]
        user: user id
        """
        try:
            _type = TaskType(_type)
        except ValueError:
            abort(403, message='invalid task type [%s]. valid values are %s' % (_type, task_types_desc))

        if not isinstance(data, list):
            data = [data]
        if _type == TaskType.SEARCHING:
            data = data[:1]

        additives = Additive.get_additives_dict()
        preparer = Model.get_preparer_model()

        structures = []
        for s, d in enumerate(data, start=1):
            if d['data']:
                d.update(structure=s, additives=additives_check(d['additives'], additives),
                         models=[preparer.copy()], status=StructureStatus.RAW, type=StructureType.UNDEFINED)
                structures.append(d)

        if not structures:
            abort(400, message='invalid structure data')

        new_job = redis.new_job(structures, current_user.id, _type, TaskStatus.PREPARING)

        if new_job is None:
            abort(500, message='modeling server error')

        return dict(task=new_job['id'], status=TaskStatus.PREPARING, type=_type, date=new_job['created_at'],
                    user=current_user), 201


uf_post = reqparse.RequestParser()
uf_post.add_argument('file.url', type=url, dest='file_url')
uf_post.add_argument('file.path', type=str, dest='file_path')
uf_post.add_argument('structures', type=FileStorage, location='files')


class UploadTask(DBAuthResource):
    @swagger.operation(
        notes='Create validation task from uploaded structures file',
        nickname='upload',
        responseClass=TaskPostResponseFields.__name__,
        parameters=[dict(name='structures', description='RDF SDF MRV SMILES file', required=True,
                         allowMultiple=False, dataType='file', paramType='body')],
        responseMessages=[dict(code=201, message="validation task created"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=400, message="structure file required"),
                          dict(code=403, message="invalid task type"),
                          dict(code=500, message="modeling server error")])
    @marshal_with(TaskPostResponseFields.resource_fields)
    @request_arguments_parser(uf_post)
    def post(self, structures=None, file_url=None, file_path=None) -> Tuple[Dict, int]:
        """
        Structures file upload

        Need for batch modeling mode.
        Any chemical structure formats convertable with Chemaxon JChem can be passed.

        conditions in files should be present in next key-value format:
        additive.amount.1 --> string = float [possible delimiters: :, :=, =]
        temperature --> float
        pressure --> float
        additive.2 --> string
        amount.2 --> float
        where .1[.2] is index of additive. possible set multiple additives.

        example [RDF]:
        $DTYPE additive.amount.1
        $DATUM water = .4
        $DTYPE temperature
        $DATUM 298
        $DTYPE pressure
        $DATUM 0.9
        $DTYPE additive.2
        $DATUM DMSO
        $DTYPE amount.2
        $DATUM 0.6

        parsed as:
        temperature = 298
        pressure = 0.9
        additives = [{"name": "water", "amount": 0.4, "type": x, "additive": y1}, \
                     {"name": "DMSO", "amount": 0.6, "type": x, "additive": y2}]
        where "type" and "additive" obtained from DataBase by name

        see task/create doc about acceptable conditions values and additives types and response structure.
        """
        if file_url is None:  # smart frontend
            if file_path:  # NGINX upload
                file_name = Path(file_path).name
                if (UPLOAD_ROOT / file_name).exists():
                    file_url = url_for('.batch_file', file=file_name, _external=True)
            elif structures:  # flask
                file_name = str(uuid4())
                structures.save((UPLOAD_ROOT / file_name).as_posix())
                file_url = url_for('.batch_file', file=file_name, _external=True)

            if file_url is None:
                abort(400, message='structure file required')

        preparer = Model.get_preparer_model()

        new_job = redis.new_file_job(file_url, preparer, current_user.id, TaskType.MODELING)
        if new_job is None:
            abort(500, message='modeling server error')

        return dict(task=new_job['id'], status=TaskStatus.PREPARING, type=TaskType.MODELING, date=new_job['created_at'],
                    user=current_user), 201
