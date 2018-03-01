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
from pony.orm import Database
from .web import load_tables as _main
from ..config import DB_MAIN, SCOPUS_ENABLE, JOBS_ENABLE

db = Database()
User, Subscription, Post, BlogPost, TeamPost, Meeting, Thesis, Email, Attachment = _main(db, DB_MAIN)

if JOBS_ENABLE:
    from .predictions import load_tables as _save
    from ..config import DB_PRED
    Task, Model, Destination, Additive = _save(db, DB_PRED)
if SCOPUS_ENABLE:
    from .scopus import load_tables as _scopus
    from ..config import DB_SCOPUS
    Author, Journal = _scopus(db, DB_SCOPUS)
