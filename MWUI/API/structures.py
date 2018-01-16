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
from flask_restful import marshal
from flask_restful.fields import (Nested, String, Integer, Float, Boolean, List, DateTime,
                                  MarshallingException, is_indexable_but_not_string, get_value)
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


class ListDefault(List):
    def output(self, key, data):
        value = get_value(key if self.attribute is None else self.attribute, data)

        if value is None:
            return self.default.copy() if hasattr(self.default, 'copy') else self.default

        # we cannot really test for external dict behavior
        if is_indexable_but_not_string(value) and not isinstance(value, dict):
            return self.format(value)

        return [marshal(value, self.container.nested)]


@swagger.model
class AdditiveFields:
    """
    additive from list of accessible
    amount - is part of total volume for solvents or model specific for another substances
    """
    common_fields = dict(additive=Integer, name=String)
    resource_fields = dict(amount=Float, **common_fields)


@swagger.model
class AdditiveResponseFields:
    common_fields = dict(structure=String, type=TypeResponseField)
    resource_fields = dict(**common_fields, **AdditiveFields.resource_fields)


@swagger.model
class ModelFields:
    resource_fields = dict(model=Integer, name=String)


@swagger.model
class ModelResultResponseFields:
    resource_fields = dict(type=TypeResponseField, key=String, value=String)


@swagger.model
@swagger.nested(results=ModelResultResponseFields.__name__)
class ModelResponseFields:
    common_fields = dict(type=TypeResponseField, description=String, **ModelFields.resource_fields)
    resource_fields = dict(results=ListDefault(Nested(ModelResultResponseFields.resource_fields), default=[]),
                           **common_fields)


@swagger.model
class DescriptionFields:
    resource_fields = dict(value=String, key=String)


@swagger.model
@swagger.nested(additives=AdditiveFields.__name__, models=ModelFields.__name__, description=DescriptionFields.__name__)
class TaskStructureCreateFields:
    common_fields = dict(temperature=Float(298), pressure=Float(1),
                         description=ListDefault(Nested(DescriptionFields.resource_fields), default=[]))
    additives_field = dict(additives=ListDefault(Nested(AdditiveFields.resource_fields), default=[]))
    data_field = dict(data=String)

    resource_fields = dict(**common_fields, **additives_field, **data_field)


@swagger.model
@swagger.nested(additives=AdditiveFields.__name__, models=ModelFields.__name__, description=DescriptionFields.__name__)
class TaskStructureModelFields:
    structure_field = dict(structure=Integer)
    to_delete_fields = dict(todelete=Boolean(False))
    models_field = dict(models=ListDefault(Nested(ModelFields.resource_fields), default=[]))

    resource_fields = dict(**structure_field, **to_delete_fields, **models_field,
                           **TaskStructureCreateFields.common_fields, **TaskStructureCreateFields.additives_field)


@swagger.model
@swagger.nested(additives=AdditiveFields.__name__, models=ModelFields.__name__,
                description=DescriptionFields.__name__)
class TaskStructurePrepareFields:
    resource_fields = dict(**TaskStructureCreateFields.data_field, **TaskStructureModelFields.resource_fields)


@swagger.model
@swagger.nested(additives=AdditiveFields.__name__, models=ModelFields.__name__, description=DescriptionFields.__name__)
class TaskStructureFields:
    common_fields = dict(**TaskStructureCreateFields.common_fields, **TaskStructureCreateFields.data_field,
                         **TaskStructureModelFields.structure_field)
    resource_fields = dict(status=type_field_factory(StructureStatus), type=type_field_factory(StructureType),
                           **TaskStructureCreateFields.additives_field, **TaskStructureModelFields.models_field,
                           **common_fields)


@swagger.model
@swagger.nested(additives=AdditiveResponseFields.__name__, models=ModelResponseFields.__name__,
                description=DescriptionFields.__name__)
class TaskStructureResponseFields:
    """
    data structure which returned as response
    """
    resource_fields = dict(models=ListDefault(Nested(ModelResponseFields.resource_fields), default=[]),
                           additives=ListDefault(Nested(AdditiveResponseFields.resource_fields), default=[]),
                           status=TypeResponseField, type=TypeResponseField, **TaskStructureFields.common_fields)


@swagger.model
class TaskPostResponseFields:
    """
    response for post query on task creation, revalidation or modeling
    """
    resource_fields = dict(task=String, status=TypeResponseField, type=TypeResponseField,
                           date=DateTime(dt_format='iso8601'), user=UserResponseField)


@swagger.model
@swagger.nested(structures=TaskStructureResponseFields.__name__)
class TaskGetResponseFields:
    """
    response for get query with preparation or modeling results
    """
    resource_fields = dict(structures=ListDefault(Nested(TaskStructureResponseFields.resource_fields), default=[]),
                           **TaskPostResponseFields.resource_fields)


@swagger.model
class TaskDeleteResponseFields:
    resource_fields = TaskPostResponseFields.resource_fields


""" magic 
"""


@swagger.model
class AdditiveMagicResponseFields:
    """
    response about available additives
    """
    resource_fields = dict(**AdditiveFields.common_fields, **AdditiveResponseFields.common_fields)


@swagger.model
@swagger.nested(additives=AdditiveResponseFields.__name__, description=DescriptionFields.__name__)
class TaskStructureMagicResponseFields:
    """
    data structure which returned as response
    """
    resource_fields = dict(additives=ListDefault(Nested(AdditiveResponseFields.resource_fields), default=[]),
                           type=TypeResponseField, **TaskStructureFields.common_fields)


@swagger.model
@swagger.nested(example=TaskStructureMagicResponseFields.__name__)
class ModelMagicResponseFields:
    """
    response about available models
    """
    resource_fields = dict(example=Nested(TaskStructureMagicResponseFields.resource_fields),
                           **ModelResponseFields.common_fields)


""" model deploy 
"""


@swagger.model
class DestinationFields:
    resource_fields = dict(host=String, port=Integer(6379), password=String, name=String)


@swagger.model
@swagger.nested(destinations=DestinationFields.__name__, example=TaskStructureCreateFields.__name__)
class ModelRegisterFields:
    resource_fields = dict(name=String, type=type_field_factory(ModelType),
                           destinations=List(Nested(DestinationFields.resource_fields)),
                           example=Nested(TaskStructureCreateFields.resource_fields))


""" auth
"""


@swagger.model
class LogInFields:
    resource_fields = dict(user=String, password=String)


""" db lists
"""


@swagger.model
class TasksList:
    resource_fields = dict(task=String, date=DateTime(dt_format='iso8601'))
