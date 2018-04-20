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
from CGRdb.config import DB_DATA_LIST
from flask import Blueprint
from flask_restful import Api
from werkzeug.routing import BaseConverter, ValidationError
from .list import SavedRecordsList
from .record import SavedRecord
from ..common import swagger
from ..jobs.create import CreateTask


class DBNameConverter(BaseConverter):
    def to_python(self, value):
        if value in DB_DATA_LIST:
            return value
        raise ValidationError()


class DBTableConverter(BaseConverter):
    def to_python(self, value):
        if value in ('Molecule', 'mol', 'molecule', 'm', 'M'):
            return 'MOLECULE'
        if value in ('Reaction', 'reaction', 'r', 'R'):
            return 'REACTION'
        raise ValidationError()


def register_converter(converter, name=None):
    """
    Register a custom URL map converters, available application wide.
    :param converter: converter class
    :param name: the optional name of the filter, otherwise the function name will be used.
    """
    def f(state):
        state.app.url_map.converters[name or converter.__name__] = converter

    return f


api_bp = Blueprint('storage', __name__)
api = swagger.docs(Api(api_bp), apiVersion='1.0', description='CGRdb API', api_spec_url='/doc/spec')

api_bp.record_once(register_converter(DBNameConverter, 'dbname'))
api_bp.record_once(register_converter(DBTableConverter, 'dbtable'))

api.add_resource(SavedRecordsList, '/<dbname:database>/<dbtable:table>/records')
api.add_resource(SavedRecord, '/<dbname:database>/<dbtable:table>/records/<int:metadata>')

api.add_resource(CreateTask, '/validate/<int:_type>')
