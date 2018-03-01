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
from .create import UploadTask, CreateTask
from .deploy import RegisterModels
from .meta import AvailableModels, BatchDownload
from .model import ModelTask
from .prepare import PrepareTask
from .save import SavedTask, SavedTasksList
from ..common import swagger
from ...config import VIEW_ENABLE


api_bp = Blueprint('api', __name__)
api = swagger.docs(Api(api_bp), apiVersion='2.0', description='MWUI API', api_spec_url='/doc/spec')


api.add_resource(CreateTask, '/task/create/<int:_type>')
api.add_resource(UploadTask, '/task/upload')
api.add_resource(PrepareTask, '/task/prepare/<string:task>')
api.add_resource(ModelTask, '/task/process/<string:task>', '/task/model/<string:task>')  # model deprecated
api.add_resource(SavedTask, '/task/saves/<string:task>', '/task/results/<string:task>')  # results deprecated
api.add_resource(SavedTasksList, '/task/saves')

api.add_resource(AvailableModels, '/resources/models')
api.add_resource(RegisterModels, '/admin/models')

api_bp.add_url_rule('/task/batch_file/<string:file>', view_func=BatchDownload.as_view('batch_file'))

if VIEW_ENABLE:
    from .meta import ExampleView
    api_bp.add_url_rule('/example/<int:_id>', view_func=ExampleView.as_view('example'))
