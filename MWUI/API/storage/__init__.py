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
from ..common import swagger


class DBNameConverter(BaseConverter):
    def to_python(self, value):
        if value in DB_DATA_LIST:
            return value
        raise ValidationError()


class DBTableConverter(BaseConverter):
    def to_python(self, value):
        if value in ('Molecule', 'mol', 'molecule', 'm', 'M'):
            return 0
        if value in ('Reaction', 'reaction', 'r', 'R'):
            return 1
        raise ValidationError()


api_bp = Blueprint('db_api', __name__)
api = swagger.docs(Api(api_bp), apiVersion='1.0', description='CGRdb API', api_spec_url='/doc/spec')

api_bp.add_app_url_map_converter(DBNameConverter, 'dbname')
api_bp.add_app_url_map_converter(DBTableConverter, 'dbtable')


api.add_resource(SavedRecordsList, '/<dbname:database>/<dbtable:table>/records')
