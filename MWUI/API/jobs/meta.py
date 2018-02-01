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
from flask import redirect, url_for, send_from_directory
from flask.views import View
from flask_login import current_user
from flask_restful import marshal_with
from pony.orm import db_session
from .common import redis
from ..common import DBAuthResource, swagger, dynamic_docstring, abort, authenticate
from ..structures import ModelMagicResponseFields
from ...config import UPLOAD_PATH
from ...constants import ModelType
from ...models import Model


models_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in ModelType)


class ExampleView(View):
    methods = ['GET']
    decorators = [authenticate, db_session]

    def dispatch_request(self, _id):
        """
        Get example task
        """
        m = Model.get(id=_id)
        if not m or m.type == ModelType.PREPARER:
            abort(404)

        new_job = redis.new_job([m.example], current_user.id, m.type.get_task_type())
        if new_job is None:
            abort(500)

        return redirect(url_for('view.predictor') + '#/prepare/?task=%s' % new_job['id'])


class AvailableModels(DBAuthResource):
    @swagger.operation(
        notes='Get available models',
        nickname='modellist',
        responseClass=ModelMagicResponseFields.__name__,
        responseMessages=[dict(code=200, message="models list"), dict(code=401, message="user not authenticated")])
    @marshal_with(ModelMagicResponseFields.resource_fields)
    @dynamic_docstring(models_types_desc)
    def get(self):
        """
        Get available models list

        response format:
        example - chemical structure in in smiles or marvin or cml format
        description - description of model. in markdown format.
        name - model name
        type - model type: {0}
        model - id
        """
        return list(Model.get_models_dict(skip_destinations=True, skip_example=False).values()), 200


class BatchDownload(View):
    methods = ['GET']

    def dispatch_request(self, file):
        return send_from_directory(directory=UPLOAD_PATH, filename=file)
