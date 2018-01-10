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
from pony.orm import db_session
from .common import fetch_task, abort, results_fetch
from ..common import AuthResource, swagger
from ..structures import TaskPostResponseFields, TaskGetResponseFields
from ...config import RESULTS_PER_PAGE
from ...constants import TaskType, TaskStatus
from ...models import Task, User


class ResultsTask(AuthResource):
    @swagger.operation(
        notes='Get saved modeled task',
        nickname='saved',
        responseClass=TaskGetResponseFields.__name__,
        parameters=[dict(name='task', description='Task ID', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='page', description='Results pagination', required=False,
                         allowMultiple=False, dataType='int', paramType='query')],
        responseMessages=[dict(code=200, message="modeled task"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this task'),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only validation tasks acceptable')])
    def get(self, task):
        """
        Task with modeling results of structures with conditions

        all structures include only models with nonempty results lists.
        see /task/model get doc.
        """
        try:
            task = int(task)
        except ValueError:
            abort(404, message='invalid task id. Use int Luke')

        page = results_fetch.parse_args().get('page')
        with db_session:
            result = Task.get(id=task)
            if not result:
                abort(404, message='Invalid task id. Perhaps this task has already been removed')

            if result.user.id != current_user.id:
                abort(403, message='User access deny. You do not have permission to this task')

            structures = result.get_data(raw=True)
            if page:
                structures = structures[RESULTS_PER_PAGE * (page - 1): RESULTS_PER_PAGE * page]

        return dict(task=task, status=TaskStatus.PROCESSED.value, date=result.date.strftime("%Y-%m-%d %H:%M:%S"),
                    type=result._type, user=result.user.id, structures=structures), 200

    @swagger.operation(
        notes='Save modeled task',
        nickname='save',
        responseClass=TaskPostResponseFields.__name__,
        parameters=[dict(name='task', description='Task ID', required=True,
                         allowMultiple=False, dataType='str', paramType='path')],
        responseMessages=[dict(code=201, message="modeled task saved"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this task'),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only modeled tasks acceptable'),
                          dict(code=406, message='task type is invalid. only modeling tasks acceptable'),
                          dict(code=500, message="modeling server error"),
                          dict(code=512, message='task not ready')])
    def post(self, task):
        """
        Store in database modeled task

        only modeled tasks can be saved.
        failed models in structures skipped.
        """
        result, ended_at = fetch_task(task, TaskStatus.PROCESSED)
        if result['type'] == TaskType.SEARCHING:
            abort(406, message='task type is invalid. only modeling tasks acceptable')

        with db_session:
            _task = Task(result['structures'], type=result['type'], date=ended_at, user=User[current_user.id])

        return dict(task=_task.id, status=TaskStatus.PROCESSED.value, date=ended_at.strftime("%Y-%m-%d %H:%M:%S"),
                    type=result['type'].value, user=current_user.id), 201
