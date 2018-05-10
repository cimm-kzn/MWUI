# -*- coding: utf-8 -*-
#
#  Copyright 2018 Ramil Nugmanov <stsouko@live.ru>
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
from CGRdb import Loader
from CGRdb.config import DB_DATA_LIST
from flask_login import current_user
from flask_restful import marshal_with, marshal
from flask_restful.reqparse import RequestParser
from flask_restful.inputs import positive, boolean
from math import ceil
from pony.orm import flush
from .common import db_post
from .marshal import RecordStructureFields, RecordResponseFields, RecordStructureResponseFields, RecordCountFields
from ..common import DBAuthResource, swagger, request_arguments_parser, abort
from ..jobs.common import fetch_task
from ...config import RESULTS_PER_PAGE
from ...constants import UserRole, TaskStatus, StructureStatus, StructureType, TaskType
from ...models import User


db_get = RequestParser(bundle_errors=True)
db_get.add_argument('user', type=positive, help='User number. by default current user return. {error_msg}')
db_get.add_argument('page', type=positive, help='Page number. by default first page return. {error_msg}', default=1)
db_get.add_argument('full', type=boolean, help='Full records. by default only record metadata return. {error_msg}',
                    default=False)

db_count = RequestParser(bundle_errors=True)
db_count.add_argument('user', type=positive, help='User number. by default current user return. {error_msg}')

Loader.load_schemas(user_entity=User)


class SavedRecordsList(DBAuthResource):
    @swagger.operation(
        notes='Get list of records',
        nickname='records_list',
        parameters=[dict(name='database', description='DataBase name: [%s]' % ', '.join(DB_DATA_LIST), required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='table', description='Table name: [molecule, reaction]', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='user', description='user ID', required=False,
                         allowMultiple=False, dataType='int', paramType='query'),
                    dict(name='page', description='records pagination', required=False,
                         allowMultiple=False, dataType='int', paramType='query'),
                    dict(name='full', description='records full data', required=False,
                         allowMultiple=False, dataType='bool', paramType='query')],
        responseClass=RecordResponseFields.__name__,
        responseMessages=[dict(code=200, message="saved data"),
                          dict(code=400, message="user and page must be a positive integer or None"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message="user access deny")])
    @request_arguments_parser(db_get)
    def get(self, database, table, page, full, user=None):
        """
        Get user's records
        """
        if user is None:
            user = current_user.id

        if user == current_user.id:
            if not current_user.role_is((UserRole.ADMIN, UserRole.DATA_MANAGER, UserRole.DATA_FILLER)):
                abort(403, message='user access deny. You do not have permission to database')
        elif not current_user.role_is((UserRole.ADMIN, UserRole.DATA_MANAGER)):
            abort(403, message="user access deny. You do not have permission to see another user's data")

        entity = Loader.get_database(database)[table == 'REACTION']
        q = entity.select(lambda x: x.user_id == user).order_by(lambda x: x.id).prefetch(entity.metadata)\
            .page(page, pagesize=RESULTS_PER_PAGE)

        return marshal([x for x in q for x in x.metadata],
                       (RecordStructureResponseFields if full else RecordResponseFields).resource_fields)

    @swagger.operation(
        notes='add new record',
        nickname='add_record',
        parameters=[dict(name='database', description='DataBase name: [%s]' % ', '.join(DB_DATA_LIST), required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='table', description='Table name: [molecule, reaction]', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='task', description='Validated structure task id', required=True,
                         allowMultiple=False, dataType='str', paramType='form')],
        responseClass=RecordStructureResponseFields.__name__,
        responseMessages=[dict(code=201, message="saved data"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message="user access deny"),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only validated tasks acceptable'),
                          dict(code=406, message='task type is invalid. only populating tasks acceptable'),
                          dict(code=500, message="modeling server error"),
                          dict(code=512, message='task not ready')])
    @marshal_with(RecordStructureResponseFields.resource_fields)
    @request_arguments_parser(db_post)
    @fetch_task(TaskStatus.PREPARED)
    def post(self, task, database, table, job, ended_at):
        """
        add new records from task
        """
        if job['type'] != TaskType.POPULATING:
            abort(406, message='Task type is invalid')

        if not current_user.role_is((UserRole.ADMIN, UserRole.DATA_MANAGER, UserRole.DATA_FILLER)):
            abort(403, message='User access deny. You do not have permission to database')

        entity = Loader.get_database(database)[table == 'REACTION']
        res = []
        for s in job['structures']:
            if s['status'] != StructureStatus.CLEAR or s['type'] != StructureType[table]:
                continue
            data = marshal(s, RecordStructureFields.resource_fields)
            structure = data.pop('data')
            in_db = entity.find_structure(structure)
            if not in_db:
                in_db = entity(structure, current_user.get_user())

            res.append(in_db.add_metadata(data, current_user.get_user()))

        flush()
        return res, 201


class SavedRecordsCount(DBAuthResource):
    @swagger.operation(
        notes='Get count of records',
        nickname='records_count',
        parameters=[dict(name='database', description='DataBase name: [%s]' % ', '.join(DB_DATA_LIST), required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='table', description='Table name: [molecule, reaction]', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='user', description='user ID', required=False,
                         allowMultiple=False, dataType='int', paramType='query')],
        responseClass=RecordCountFields.__name__,
        responseMessages=[dict(code=200, message="saved data"),
                          dict(code=400, message="user must be a positive integer or None"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message="user access deny")])
    @request_arguments_parser(db_count)
    def get(self, database, table, user=None):
        """
        Get user's records
        """
        if user is None:
            user = current_user.id
        if user == current_user.id:
            if not current_user.role_is((UserRole.ADMIN, UserRole.DATA_MANAGER, UserRole.DATA_FILLER)):
                abort(403, message='user access deny. You do not have permission to database')
        elif not current_user.role_is((UserRole.ADMIN, UserRole.DATA_MANAGER)):
            abort(403, message="user access deny. You do not have permission to see another user's data")

        entity = Loader.get_database(database)[table == 'REACTION']
        q = entity.select(lambda x: x.user_id == user).count()

        return dict(data=q, pages=ceil(q / RESULTS_PER_PAGE))
