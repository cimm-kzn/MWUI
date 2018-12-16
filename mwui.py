#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
#  Copyright 2015-2017 Ramil Nugmanov <stsouko@live.ru>
#  Copyright 2015 Oleg Varlamov <ovarlamo@gmail.com>
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
import sys
sys.path.append('/home/stsouko/Private/bydlocoding/predictor/CORE')


from CIPress.flask import init


config = {'DEBUG': True, 'logo': 'CIMM', 'RESIZE_URL': '/static/images',
          'RESIZE_ROOT': 'CORE/CIPress/static/images',
          'copyright': 'Kazan Chemoinformatics and Molecular Modeling Laboratory 2018',
          'schema': 'cipress', 'blog_posts': 10,
          'database': {'provider': 'postgres', 'user': 'postgres', 'password': 'postgres',
                       'host': 'localhost', 'database': 'postgres', 'port': 5432},
          'redis_mail': 'mail', 'redis': {},
          'mail_from': ('CIMM', 'cimm@kpfu.ru'), 'mail_sign': ('inkey', 'signer'),
          'registration_mail': {'message': 'welcome %s', 'subject': 'title'},
          'restore_mail': {'message': 'welcome %s', 'subject': 'title'}}

'''
from pony.orm import Database, db_session
import CIPress.extensions.main
import CIPress.extensions.auth
import CIPress.extensions.blog
from CIPress.database import LazyEntityMeta
db = Database()
LazyEntityMeta.attach(db, 'cipress')
db.bind(**config['database'])
db.generate_mapping(create_tables=True)
'''

app = init(config)
app.run('localhost', port=5000)
