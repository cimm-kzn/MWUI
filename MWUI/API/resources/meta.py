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
from pony.orm import db_session
from .common import AuthResource, swagger, dynamic_docstring
from ..structures import ModelListFields, AdditivesListFields
from ...constants import AdditiveType, ModelType, TaskType, TaskStatus, StructureType, StructureStatus, ResultType
from ...models import Model, Additive


additives_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in AdditiveType)
models_types_desc = ', '.join('{0.value} - {0.name}'.format(x) for x in ModelType)


class AvailableModels(AuthResource):
    @swagger.operation(
        notes='Get available models',
        nickname='modellist',
        responseClass=ModelListFields.__name__,
        responseMessages=[dict(code=200, message="models list"), dict(code=401, message="user not authenticated")])
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
        with db_session:
            models = list(Model.get_models_dict(skip_destinations=True, skip_example=False, raw=True).values())
        return models, 200


class AvailableAdditives(AuthResource):
    @swagger.operation(
        notes='Get available additives',
        nickname='additives',
        responseClass=AdditivesListFields.__name__,
        responseMessages=[dict(code=200, message="additives list"), dict(code=401, message="user not authenticated")])
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
        out = []
        with db_session:
            for x in Additive.get_additives_dict(raw=True).values():
                out.append(x)
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
