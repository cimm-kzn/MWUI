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
from flask_login import current_user
from flask_restful import marshal_with
from .common import additives_check, fetch_task, redis, results_page, request_json_parser
from .marshal import TaskPostResponseFields, TaskStructureModelFields, TaskGetResponseFields
from ..common import DBAuthResource, swagger, dynamic_docstring, request_arguments_parser, abort
from ...constants import StructureStatus, TaskStatus, ResultType
from ...models import Model, Additive


results_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in ResultType)


class ModelTask(DBAuthResource):
    @swagger.operation(
        nickname='processed',
        responseClass=TaskGetResponseFields.__name__,
        parameters=[dict(name='task', description='Task ID', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='page', description='Results pagination', required=False,
                         allowMultiple=False, dataType='int', paramType='query')],
        responseMessages=[dict(code=200, message="processed task"),
                          dict(code=400, message="page must be a positive integer or None"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this task'),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only validation tasks acceptable'),
                          dict(code=500, message="modeling server error"),
                          dict(code=512, message='task not ready')])
    @marshal_with(TaskGetResponseFields.resource_fields)
    @request_arguments_parser(results_page)
    @fetch_task(TaskStatus.PROCESSED)
    @dynamic_docstring(results_types_desc)
    def get(self, task, job, ended_at):
        """
        Task with results of structures processing

        all structures include models with results lists.
        failed models contain empty results lists.

        see also /task/prepare get doc.

        available model results response types: {0}
        """
        return dict(task=task, date=ended_at, status=job['status'], type=job['type'], user=current_user,
                    structures=job['structures']), 200

    @swagger.operation(
        nickname='processing',
        responseClass=TaskPostResponseFields.__name__,
        parameters=[dict(name='task', description='Task ID', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='structures', description='Conditions and selected models for structure[s]',
                         required=True, allowMultiple=False, dataType=TaskStructureModelFields.__name__,
                         paramType='body')],
        responseMessages=[dict(code=201, message="processing task created"),
                          dict(code=400, message="invalid structure data"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this task'),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only validation tasks acceptable'),
                          dict(code=500, message="modeling server error"),
                          dict(code=512, message='task not ready')])
    @marshal_with(TaskPostResponseFields.resource_fields)
    @fetch_task(TaskStatus.PREPARED)
    @request_json_parser(TaskStructureModelFields.resource_fields)
    def post(self, task, data, job, ended_at):
        """
        Create processing task

        send only changed conditions or todelete marks. see task/prepare doc.
        """
        prepared = {s['structure']: s for s in job['structures']}
        tmp = {x['structure']: x for x in data} if isinstance(data, list) else {data['structure']: data}

        if 0 in tmp:
            abort(400, message='invalid structure data')

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
                                    models[m['model']]['type'].compatible(ps['type'], job['type'])]
                else:  # recheck models for existing
                    ps['models'] = [models[m['model']].copy() for m in ps['models'] if m['model'] in models]

                if d['temperature']:
                    ps['temperature'] = d['temperature']

                if d['pressure']:
                    ps['pressure'] = d['pressure']

                if d['description']:
                    ps['description'] = d['description']

            structures.append(ps)

        if not structures:
            abort(400, message='invalid structure data')

        new_job = redis.new_job(structures, job['user'], job['type'], TaskStatus.PROCESSING)
        if new_job is None:
            abort(500, message='modeling server error')

        return dict(task=new_job['id'], status=TaskStatus.PROCESSING, type=job['type'], date=new_job['created_at'],
                    user=current_user), 201
