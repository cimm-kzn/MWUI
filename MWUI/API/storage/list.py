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
from flask_restful import marshal_with, reqparse
from flask_restful.inputs import positive
from .marshal import RecordsList
from ..common import DBAuthResource, swagger, request_arguments_parser, abort
from ...config import RESULTS_PER_PAGE
from ...constants import UserRole
from ...models import User


db_args = reqparse.RequestParser(bundle_errors=True)
db_args.add_argument('user', type=positive, help='User number. by default current user return. {error_msg}')
db_args.add_argument('page', type=positive, help='Page number. by default all pages return. {error_msg}')
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
                         allowMultiple=False, dataType='int', paramType='query')],
        responseClass=RecordsList.__name__,
        responseMessages=[dict(code=200, message="saved data"),
                          dict(code=400, message="user and page must be a positive integer or None"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=403, message="user access deny")])
    @marshal_with(RecordsList.resource_fields)
    @request_arguments_parser(db_args)
    def get(self, database, table, user=None, page=None):
        """
        Get user's records
        """
        table = Loader.get_database(database)[table]
        if user is not None:
            if not current_user.role_is((UserRole.ADMIN, UserRole.DATA_MANAGER)):
                abort(403, message='User access deny. You do not have permission')
            q = table.select(lambda x: x.user_id == user).order_by(table.id)
        else:
            q = table.select(lambda x: x.user_id == current_user.id).order_by(table.id)

        if page is not None:
            q = q.page(page, pagesize=RESULTS_PER_PAGE)
        return list(q)
