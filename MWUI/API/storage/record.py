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
from pony.orm import flush, ObjectNotFound
from .common import db_post
from .marshal import RecordResponseFields, RecordStructureFields, RecordStructureResponseFields, CreateRecordFields
from ..common import DBAuthResource, swagger, request_arguments_parser, abort
from ..jobs.common import fetch_task
from ...constants import UserRole, TaskStatus, StructureStatus, StructureType, TaskType


class SavedRecord(DBAuthResource):
    @swagger.operation(
        notes='Get record',
        nickname='get_record',
        responseClass=RecordStructureResponseFields.__name__,
        parameters=[dict(name='database', description='DataBase name: [%s]' % ', '.join(DB_DATA_LIST), required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='table', description='Table name: [molecule, reaction]', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='metadata', description='Record ID', required=True,
                         allowMultiple=False, dataType='int', paramType='path')],
        responseMessages=[dict(code=200, message='metadata record'),
                          dict(code=401, message='user not authenticated'),
                          dict(code=403, message='user access deny'),
                          dict(code=404, message='invalid record id')])
    @marshal_with(RecordStructureResponseFields.resource_fields)
    def get(self, database, table, metadata):
        """
        Record with requested metadata id
        """
        return self.__get_record(database, table, metadata), 200

    @swagger.operation(
        notes='Update record',
        nickname='update_record',
        responseClass=RecordStructureResponseFields.__name__,
        parameters=[dict(name='database', description='DataBase name: [%s]' % ', '.join(DB_DATA_LIST), required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='table', description='Table name: [molecule, reaction]', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='metadata', description='Record ID', required=True,
                         allowMultiple=False, dataType='int', paramType='path'),
                    dict(name='task', description='Validated structure task id', required=True,
                         allowMultiple=False, dataType=CreateRecordFields.__name__, paramType='body')],
        responseMessages=[dict(code=201, message='record updated'),
                          dict(code=400, message='task structure has errors or invalid type'),
                          dict(code=400, message='record structure conflict'),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this task'),
                          dict(code=404, message='invalid record id'),
                          dict(code=404, message='invalid task id. perhaps this task has already been removed'),
                          dict(code=406, message='task status is invalid. only validated tasks acceptable'),
                          dict(code=406, message='task type is invalid. only populating tasks acceptable'),
                          dict(code=500, message="modeling server error"),
                          dict(code=512, message='task not ready')])
    @marshal_with(RecordStructureResponseFields.resource_fields)
    @request_arguments_parser(db_post)
    @fetch_task(TaskStatus.PREPARED)
    def post(self, task, database, table, metadata, job, ended_at):
        """
        update record from task.
        """
        if job['type'] != TaskType.POPULATING:
            abort(406, message='Task type is invalid')

        s = job['structures'][0]
        if s['status'] != StructureStatus.CLEAR or s['type'] != StructureType[table]:
            abort(400, message='task structure has errors or invalid type')

        data = marshal(s, RecordStructureFields.resource_fields)
        structure = data.pop('data')

        meta = self.__get_record(database, table, metadata)
        in_db = Loader.get_database(database)[table == 'REACTION'].find_structure(structure)

        if in_db:
            if in_db != meta.structure:
                abort(400, message='record structure conflict. db already has this structure. use add_record method')
        else:
            if table == 'MOLECULE':
                try:
                    meta.structure.new_structure(structure, current_user.get_user())
                except AssertionError as e:
                    abort(400, message='task structure has errors: {}'.format(e))
            else:
                meta.structure.update_structure(structure, current_user.get_user())
                flush()

        # update metadata
        meta.data = data
        meta.user_id = current_user.id

        return meta, 201

    @swagger.operation(
        notes='Delete record',
        nickname='delete_record',
        responseClass=RecordResponseFields.__name__,
        parameters=[dict(name='database', description='DataBase name: [%s]' % ', '.join(DB_DATA_LIST), required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='table', description='Table name: [molecule, reaction]', required=True,
                         allowMultiple=False, dataType='str', paramType='path'),
                    dict(name='metadata', description='Record ID', required=True,
                         allowMultiple=False, dataType='int', paramType='path')],
        responseMessages=[dict(code=202, message="record deleted"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message='user access deny. you do not have permission to this record'),
                          dict(code=404, message='invalid record id')])
    @marshal_with(RecordResponseFields.resource_fields)
    def delete(self, database, table, metadata):
        """
        Delete record from db

        if table is REACTION and reaction consist only this metadata record, then reaction also will be deleted.
        """
        data = self.__get_record(database, table, metadata)
        # resp = marshal(data, RecordResponseFields.resource_fields)
        if data.structure.metadata.count() == 1 and table == 'REACTION':
            data.structure.delete()
        else:
            data.delete()
        return data, 202

    @staticmethod
    def __get_record(database, table, metadata):
        try:
            data = getattr(Loader.get_schema(database),
                           'MoleculeProperties' if table == 'MOLECULE' else 'ReactionConditions')[metadata]
        except ObjectNotFound:
            abort(404, message='invalid record id')

        if data.user_id != current_user.id:
            if not current_user.role_is((UserRole.ADMIN, UserRole.DATA_MANAGER)):
                abort(403, message="user access deny. You do not have permission to see another user's data")
        elif not current_user.role_is((UserRole.DATA_FILLER, UserRole.ADMIN, UserRole.DATA_MANAGER)):
            abort(403, message='user access deny. You do not have permission to database')
        return data
