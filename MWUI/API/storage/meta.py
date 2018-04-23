# -*- coding: utf-8 -*-
#
#  Copyright 2018 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of predictor.
#
#  predictor is free software; you can redistribute it and/or modify
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
from CGRdb.config import DB_DATA_LIST
from flask_login import current_user
from flask_restful import marshal_with
from ..common import DBAuthResource, swagger
from .marshal import DBUsersResponseFields
from ...constants import UserRole
from ...models import User


class AvailableDataBases(DBAuthResource):
    @swagger.operation(
        notes='Get available databases',
        nickname='dblist',
        responseMessages=[dict(code=200, message="db list"), dict(code=401, message="user not authenticated")])
    def get(self):
        """
        Get available models list
        """
        return DB_DATA_LIST, 200


class DataBaseUsers(DBAuthResource):
    @swagger.operation(
        notes='Get available users',
        nickname='dbusers',
        responseClass=DBUsersResponseFields.__name__,
        responseMessages=[dict(code=200, message="db users list"), dict(code=401, message="user not authenticated")])
    @marshal_with(DBUsersResponseFields.resource_fields)
    def get(self):
        """
        Get available users list
        """
        if current_user.role_is(UserRole.ADMIN):
            return User.select(lambda x: x._role in (UserRole.ADMIN.value, UserRole.DATA_MANAGER.value,
                                                     UserRole.DATA_FILLER.value))[:], 200
        elif current_user.role_is(UserRole.DATA_MANAGER):
            return User.select(lambda x: x._role in (UserRole.DATA_MANAGER.value, UserRole.DATA_FILLER.value))[:], 200
        else:
            return User.select(lambda x: x.id == current_user.id)[:], 200
