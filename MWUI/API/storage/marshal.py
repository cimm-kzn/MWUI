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
from CGRtools.files import MRVread, MRVwrite
from flask_restful.fields import DateTime, Integer, Float, Nested, String, MarshallingException
from io import BytesIO, StringIO
from six import binary_type
from ..common import swagger
from ..jobs.marshal import DescriptionFields, TaskStructureCreateFields
from ..marshal import UserResponseField, ListDefault, AdditiveResponseFields, AdditiveFields


class Structure(String):
    """
    Marshal a value as a MRV xml string.
    """
    def format(self, value):
        try:
            data = binary_type(value, 'utf8')
            with BytesIO(data) as d, MRVread(d) as m:
                structure = next(m)
        except (TypeError, StopIteration) as ve:
            raise MarshallingException(ve)

        return structure


class MRV(String):
    def format(self, value):
        with StringIO() as s:
            with MRVwrite(s) as m:
                m.write(value)
            structure = s.getvalue()
        return structure


@swagger.model
@swagger.nested(additives=AdditiveResponseFields.__name__, description=DescriptionFields.__name__)
class RecordStructureFields:
    """
    data structure which got from jobs task. used for converting data from tasks format to CGRdb records.
    """
    common_fields = dict(additives=ListDefault(Nested(AdditiveResponseFields.resource_fields), default=[]),
                         **TaskStructureCreateFields.common_fields)
    resource_fields = dict(data=Structure, **common_fields)


@swagger.model
class RecordResponseFields:
    """
    structure-metadata record meta (ids, date, user).
    """
    resource_fields = dict(structure=Integer(attribute='structure.id'), metadata=Integer(attribute='id'),
                           date=DateTime(dt_format='iso8601'), user=UserResponseField)


@swagger.model
class AdditiveRecordFields:
    resource_fields = dict(structure=String, type=Integer, **AdditiveFields.resource_fields)


@swagger.model
@swagger.nested(additives=AdditiveRecordFields.__name__, description=DescriptionFields.__name__)
class RecordStructureResponseFields:
    """
    full structure-metadata record
    """
    resource_fields = dict(data=MRV(attribute='structure.structure'),
                           temperature=Float(298, attribute='data.temperature'),
                           pressure=Float(1, attribute='data.pressure'),
                           description=ListDefault(Nested(DescriptionFields.resource_fields), default=[],
                                                   attribute='data.description'),
                           additives=ListDefault(Nested(AdditiveRecordFields.resource_fields), default=[],
                                                 attribute='data.additives'),
                           **RecordResponseFields.resource_fields)


@swagger.model
class DBUsersResponseFields:
    resource_fields = dict(user=Integer(attribute='id'), name=String(attribute='full_name'),
                           role=Integer(attribute='_role'))
