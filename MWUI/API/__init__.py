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
from .jobs import api as jobs_api, api_bp as jobs_bp
from .storage import api as db_api, api_bp as db_bp
from .meta import AvailableAdditives, MagicNumbers, LogIn


jobs_api.add_resource(AvailableAdditives, '/resources/additives')
jobs_api.add_resource(MagicNumbers, '/resources/magic')
jobs_api.add_resource(LogIn, '/auth')

db_api.add_resource(AvailableAdditives, '/resources/additives')
db_api.add_resource(MagicNumbers, '/resources/magic')
db_api.add_resource(LogIn, '/auth')
