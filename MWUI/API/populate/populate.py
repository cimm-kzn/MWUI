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
from functools import wraps
from flask import request, Response
from flask_login import current_user
from flask_restful import marshal, Resource
from pony.orm import db_session, flush
from time import sleep
from .common import AuthResource, swagger, fetch_task, abort, results_fetch
from ..structures import ModelRegisterFields
from ...constants import StructureStatus, TaskStatus, UserRole, TaskType, AdditiveType
from ...models import Model, Destination, Additive


def authenticate(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if current_user.is_authenticated:
            return f(*args, **kwargs)

        abort(401, message=dict(user='not authenticated'))

    return wrapper


class AuthResource(Resource):
    method_decorators = [db_session, authenticate]


class AddStructure(AuthResource):
    def get(self):
        pass

    def post(self, task):
        result, ended_at = fetch_task(task, TaskStatus.PROCESSED)

