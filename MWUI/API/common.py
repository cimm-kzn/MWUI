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
from flask_login import current_user
from flask_restful import Resource
from functools import wraps
from importlib.util import find_spec
from pony.orm import db_session
from werkzeug.exceptions import HTTPException, Aborter
from ..config import SWAGGER


if SWAGGER and find_spec('flask_restful_swagger'):
    from flask_restful_swagger import swagger
else:
    class Swagger:
        @staticmethod
        def operation(*args, **kwargs):
            def decorator(f):
                return f

            return decorator

        @staticmethod
        def docs(api, *args, **kwargs):
            return api

        @staticmethod
        def nested(*args, **kwargs):
            def decorator(f):
                return f

            return decorator

        @staticmethod
        def model(f):
            return f

    swagger = Swagger()


def abort(http_status_code, **kwargs):
    """ copy-paste from flask-restful
    """
    try:
        original_flask_abort(http_status_code)
    except HTTPException as e:
        if len(kwargs):
            e.data = kwargs
        raise


def dynamic_docstring(*sub):
    def decorator(f):
        f.__doc__ = f.__doc__.format(*sub)
        return f

    return decorator


def authenticate(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if current_user.is_authenticated:
            return f(*args, **kwargs)

        abort(401, message=dict(user='not authenticated'))

    return wrapper


def request_arguments_parser(parser):
    """
    parse arguments of requests and pass it as function keyword arguments
    :param parser: RequestParser
    """
    def dec(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            parsed_kwargs = parser.parse_args()
            return f(*args, **kwargs, **parsed_kwargs)

        return wrapper
    return dec


class AuthResource(Resource):
    method_decorators = [authenticate]


class DBAuthResource(AuthResource):
    method_decorators = AuthResource.method_decorators + [db_session]


class Abort512(HTTPException):
    code = 512
    description = 'task not ready'


original_flask_abort = Aborter(extra={512: Abort512})
