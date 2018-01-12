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
from flask_restful.fields import Nested, String, Integer, Float, Boolean, List, DateTime, MarshallingException
from importlib.util import find_spec
from ..config import SWAGGER
from ..constants import ModelType, StructureStatus, StructureType


if SWAGGER and find_spec('flask_restful_swagger'):
    from flask_restful_swagger import swagger
else:
    class Swagger:
        @staticmethod
        def nested(*args, **kwargs):
            def decorator(f):
                return f

            return decorator

        @staticmethod
        def model(f):
            return f

    swagger = Swagger()


def type_field_factory(_type):
    class TypeField(Integer):
        def __init__(self, default=0, **kwargs):
            super().__init__(default=_type(default), **kwargs)

        def format(self, value):
            try:
                mt = _type(value)
            except ValueError as ve:
                raise MarshallingException(ve)
            return mt

    TypeField.__name__ = '%sField' % _type.__name__
    return TypeField


class TypeResponseField(Integer):
    def format(self, value):
        return value.value


class UserResponseField(Integer):
    def format(self, value):
        return value.id


@swagger.model
class AdditivesFields:
    """
    additive from list of accessible
    amount - is part of total volume for solvents or model specific for another substances
    """
    resource_fields = dict(additive=Integer, amount=Float, name=String)


@swagger.model
class AdditivesResponseFields:
    resource_fields = dict(structure=String, type=TypeResponseField, **AdditivesFields.resource_fields)


@swagger.model
class ModelsFields:
    resource_fields = dict(model=Integer, name=String)


@swagger.model
class ModelResultsResponseFields:
    resource_fields = dict(type=TypeResponseField, key=String, value=String)


@swagger.model
@swagger.nested(results=ModelResultsResponseFields.__name__)
class ModelsResponseFields:
    resource_fields = dict(type=TypeResponseField, results=List(Nested(ModelResultsResponseFields.resource_fields)),
                           **ModelsFields.resource_fields)


@swagger.model
class DescriptionFields:
    resource_fields = dict(value=String, key=String)


@swagger.model
@swagger.nested(additives=AdditivesFields.__name__, models=ModelsFields.__name__,
                description=DescriptionFields.__name__)
class TaskStructureFields:
    common_fields = dict(structure=Integer, data=String, temperature=Float(298), pressure=Float(1),
                         description=List(Nested(DescriptionFields.resource_fields)))
    resource_fields = dict(additives=List(Nested(AdditivesFields.resource_fields)),
                           models=List(Nested(ModelsFields.resource_fields)),
                           status=type_field_factory(StructureStatus), type=type_field_factory(StructureType),
                           **common_fields)


@swagger.model
@swagger.nested(additives=AdditivesFields.__name__, models=ModelsFields.__name__,
                description=DescriptionFields.__name__)
class TaskStructureUpdateFields:
    resource_fields = dict(todelete=Boolean(False), **TaskStructureFields.resource_fields)


@swagger.model
@swagger.nested(additives=AdditivesResponseFields.__name__, models=ModelsResponseFields.__name__,
                description=DescriptionFields.__name__)
class TaskStructureResponseFields:
    resource_fields = dict(additives=List(Nested(AdditivesResponseFields.resource_fields)),
                           models=List(Nested(ModelsResponseFields.resource_fields)),
                           status=TypeResponseField, type=TypeResponseField, **TaskStructureFields.common_fields)


@swagger.model
class TaskPostResponseFields:
    resource_fields = dict(task=String, status=TypeResponseField, type=TypeResponseField,
                           date=DateTime(dt_format='iso8601'), user=UserResponseField)


@swagger.model
@swagger.nested(structures=TaskStructureResponseFields.__name__)
class TaskGetResponseFields:
    resource_fields = dict(structures=List(Nested(TaskStructureResponseFields.resource_fields)),
                           **TaskPostResponseFields.resource_fields)


""" magic 
"""


@swagger.model
class AdditivesListFields:
    resource_fields = dict(additive=Integer, name=String, structure=String, type=TypeResponseField)


@swagger.model
class ModelListFields:
    resource_fields = dict(example=String, description=String, type=TypeResponseField, name=String, model=Integer)


""" model deploy 
"""


@swagger.model
class DestinationsFields:
    resource_fields = dict(host=String, port=Integer(6379), password=String, name=String)


@swagger.model
@swagger.nested(destinations=DestinationsFields.__name__, example=TaskStructureFields.__name__)
class ModelRegisterFields:
    resource_fields = dict(example=Nested(TaskStructureFields.resource_fields), description=String, name=String,
                           type=type_field_factory(ModelType),
                           destinations=List(Nested(DestinationsFields.resource_fields)))


""" auth
"""


@swagger.model
class LogInFields:
    resource_fields = dict(user=String, password=String)
