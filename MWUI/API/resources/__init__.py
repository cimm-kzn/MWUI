# -*- coding: utf-8 -*-
#
#  Copyright 2017 Ramil Nugmanov <stsouko@live.ru>
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
from flask_restful import Resource
from .admin import RegisterModels
from .common import swagger
from .create import UploadTask, CreateTask
from .meta import AvailableAdditives, AvailableModels, MagicNumbers
from .model import ModelTask
from .prepare import PrepareTask
from .save import ResultsTask
from ..structures import LogInFields
from ...logins import UserLogin


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

