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
from CGRdb.config import DB_DATA_LIST
from ..common import DBAuthResource, swagger


class AvailableDataBases(DBAuthResource):
    @swagger.operation(
        notes='Get available databases',
        nickname='dblist',
        responseMessages=[dict(code=200, message="db list"), dict(code=401, message="user not authenticated")])
    def get(self):
        """
        Get available models list
        """
        return DB_DATA_LIST, 200
