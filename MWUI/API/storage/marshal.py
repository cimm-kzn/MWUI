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
from CGRtools.files import MRVread
from flask_restful.fields import DateTime, Integer, Nested, Raw, MarshallingException
from io import BytesIO
from six import binary_type
from ..common import swagger
from ..jobs.marshal import DescriptionFields, TaskStructureCreateFields
from ..marshal import TypeResponseField, UserResponseField, ListDefault, AdditiveResponseFields


class Structure(Raw):
    """
    Marshal a value as a bytes. Uses ``six.binary_type``
    """
    def format(self, value):
        try:
            data = binary_type(value, 'utf8')
            with BytesIO(data) as d, MRVread(d) as m:
                structure = next(m)
        except (TypeError, StopIteration) as ve:
            raise MarshallingException(ve)

        return structure


@swagger.model
class RecordResponseFields:
    resource_fields = dict(id=Integer, date=DateTime(dt_format='iso8601'), type=TypeResponseField,
                           user=UserResponseField)


@swagger.model
@swagger.nested(additives=AdditiveResponseFields.__name__, description=DescriptionFields.__name__)
class RecordStructureFields:
    """
    data structure which returned as response
    """
    resource_fields = dict(additives=ListDefault(Nested(AdditiveResponseFields.resource_fields), default=[]),
                           data=Structure, **TaskStructureCreateFields.common_fields)
