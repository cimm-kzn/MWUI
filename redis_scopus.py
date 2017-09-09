#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#  Copyright 2017 Ramil Nugmanov <stsouko@live.ru>
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
from MWUI.models import Author, Journal, db
from pony.orm import db_session, flush


def run(task, author_id):
    from MWUI.config import DB_PASS, DB_HOST, DB_USER, DB_NAME, DB_PORT
    db.bind('postgres', user=DB_USER, password=DB_PASS, host=DB_HOST, database=DB_NAME, port=DB_PORT)
    db.generate_mapping(create_tables=False)

    if task == 'new':
        with db_session:
            a = Author.add_author(author_id)
            if a:
                flush()
                a.update_statistics()
                Journal.update_statistics()
    elif task == 'update':
        with db_session:
            a = Author[author_id]
            if not a.is_fresh:
                a.update_articles()
                flush()
                a.update_statistics()
                Journal.update_statistics()
    else:
        print('INVALID TASK')
