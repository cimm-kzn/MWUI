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
from flask_restful import marshal
from flask_restful.fields import (String, Integer, Float, List, is_indexable_but_not_string, get_value,
                                  MarshallingException)
from .common import swagger


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


""" magic 
"""


@swagger.model
class AdditiveMagicResponseFields:
    """
    response about available additives
    """
    resource_fields = dict(**AdditiveFields.common_fields, **AdditiveResponseFields.common_fields)


""" auth
"""


@swagger.model
class LogInFields:
    resource_fields = dict(user=String, password=String)


@swagger.model
class LogInResponseFields:
    resource_fields = dict(user=Integer(attribute='id'), name=String(attribute='full_name'),
                           role=TypeResponseField(attribute='role'))
