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


def load_jobs():
    from .jobs import api, api_bp
    __add_magic(api)
    return api_bp


def load_cgrdb():
    from .storage import api, api_bp
    __add_magic(api)
    return api_bp


def __add_magic(api):
    from .meta import AvailableAdditives, MagicNumbers, LogIn
    api.add_resource(AvailableAdditives, '/resources/additives')
    api.add_resource(MagicNumbers, '/resources/magic')
    api.add_resource(LogIn, '/auth')


__all__ = [load_cgrdb.__name__, load_jobs.__name__]
