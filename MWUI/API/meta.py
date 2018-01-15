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
from flask import request
from flask_login import login_user
from flask_restful import Resource, marshal_with
from pony.orm import db_session
from .common import AuthResource, swagger, dynamic_docstring
from .structures import AdditiveMagicResponseFields, LogInFields
from ..constants import AdditiveType, ModelType, TaskType, TaskStatus, StructureType, StructureStatus, ResultType
from ..logins import UserLogin
from ..models import Additive


additives_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in AdditiveType)
models_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in ModelType)


class AvailableAdditives(AuthResource):
    @swagger.operation(
        notes='Get available additives',
        nickname='additives',
        responseClass=AdditiveMagicResponseFields.__name__,
        responseMessages=[dict(code=200, message="additives list"), dict(code=401, message="user not authenticated")])
    @marshal_with(AdditiveMagicResponseFields.resource_fields)
    @dynamic_docstring(additives_types_desc)
    def get(self):
        """
        Get available additives list

        response format:
        additive - id
        name - name of additive
        structure - chemical structure in smiles or marvin or cml format
        type - additive type: {0}
        """
        with db_session:
            out = list(Additive.get_additives_dict().values())
        return out, 200


class MagicNumbers(AuthResource):
    @swagger.operation(
        notes='Magic Numbers',
        nickname='magic',
        parameters=[],
        responseMessages=[dict(code=200, message="magic numbers"),
                          dict(code=401, message="user not authenticated")])
    def get(self):
        """
        Get Magic numbers

        Dict of all magic numbers with values.
        """
        data = {x.__name__: self.__to_dict(x) for x in [TaskType, TaskStatus, StructureType, StructureStatus,
                                                        AdditiveType, ResultType, ModelType]}

        return data, 200

    @staticmethod
    def __to_dict(enum):
        return {x.name: x.value for x in enum}


class LogIn(Resource):
    @swagger.operation(
        notes='App login',
        nickname='login',
        parameters=[dict(name='credentials', description='User credentials', required=True,
                         allowMultiple=False, dataType=LogInFields.__name__, paramType='body')],
        responseMessages=[dict(code=200, message="logged in"),
                          dict(code=400, message="invalid data"),
                          dict(code=403, message="bad credentials")])
    def post(self):
        """
        Get auth token

        Token returned in headers as remember_token.
        for use task api send in requests headers Cookie: 'remember_token=_token_'
        """
        data = request.get_json(force=True)
        if data:
            username = data.get('user')
            password = data.get('password')
            if username and password:
                user = UserLogin.get(username.lower(), password)
                if user:
                    login_user(user, remember=True)
                    return dict(message='logged in'), 200
        return dict(message='bad credentials'), 403
