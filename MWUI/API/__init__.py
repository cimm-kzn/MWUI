# -*- coding: utf-8 -*-
#
#  Copyright 2017, 2018 Ramil Nugmanov <stsouko@live.ru>
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
from flask import Blueprint
from flask_restful import Api
from importlib.util import find_spec
from .jobs import (CreateTask, UploadTask, PrepareTask, ModelTask, ResultsTask, AvailableModels, RegisterModels,
                   ExampleView, BatchDownload)
from .meta import AvailableAdditives, MagicNumbers, LogIn
from ..config import SWAGGER


api_bp = Blueprint('api', __name__)
api = Api(api_bp)

if SWAGGER and find_spec('flask_restful_swagger'):
    from flask_restful_swagger import swagger

    api = swagger.docs(api, apiVersion='2.0', description='MWUI API', api_spec_url='/doc/spec')


api.add_resource(CreateTask, '/task/create/<int:_type>')
api.add_resource(UploadTask, '/task/upload')
api.add_resource(PrepareTask, '/task/prepare/<string:task>')
api.add_resource(ModelTask, '/task/model/<string:task>')
api.add_resource(ResultsTask, '/task/results/<string:task>')
api.add_resource(AvailableAdditives, '/resources/additives')
api.add_resource(AvailableModels, '/resources/models')
api.add_resource(MagicNumbers, '/resources/magic')
api.add_resource(RegisterModels, '/admin/models')
api.add_resource(LogIn, '/auth')

api_bp.add_url_rule('/task/batch_file/<string:file>', view_func=BatchDownload.as_view('batch_file'))
api_bp.add_url_rule('/example/<int:_id>', view_func=ExampleView.as_view('example'))
