# -*- coding: utf-8 -*-
#
#  Copyright 2018 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of predictor.
#
#  predictor is free software; you can redistribute it and/or modify
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
from ..jobs import CreateTask
from ..jobs.marshal import TaskPostResponseFields, TaskStructureCreateFields
from ..common import swagger, dynamic_docstring
from ...constants import TaskType, AdditiveType


class ValidateRecord(CreateTask):
    @swagger.operation(
        nickname='create',
        responseClass=TaskPostResponseFields.__name__,
        parameters=[dict(name='structures', description='Structure[s] of molecule or reaction with optional conditions',
                         required=True, allowMultiple=False, dataType=TaskStructureCreateFields.__name__,
                         paramType='body')],
        responseMessages=[dict(code=201, message="validation task created"),
                          dict(code=400, message="invalid structure data"),
                          dict(code=401, message="user not authenticated"),
                          dict(code=500, message="modeling server error")])
    @dynamic_docstring(AdditiveType.SOLVENT)
    def post(self):
        """
        Create new record validation task

        possible to send list of TaskStructureCreateFields.
        e.g. [TaskStructureCreateFields, TaskStructureCreateFields,...]

        data field is required. field should be a string containing marvin document or cml or smiles/smirks
        additive should be in list of available additives.
        amount should be in range 0 to 1 for additives type = {0.value} [{0.name}], and positive for overs.
        temperature in Kelvin and pressure in Bar also should be positive.
        """
        return super().post(TaskType.POPULATING)
