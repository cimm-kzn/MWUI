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
from flask_restful.fields import String, Integer, Float
from .common import swagger


class TypeResponseField(Integer):
    def format(self, value):
        return value.value


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
