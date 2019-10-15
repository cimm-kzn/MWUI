# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of CIpress.
#
#  CIpress is free software; you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as published by
#  the Free Software Foundation; either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
#  GNU Lesser General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with this program; if not, see <https://www.gnu.org/licenses/>.
#
from flask import Flask
from flask_misaka import Misaka
from LazyPony import LazyEntityMeta
from misaka import HTML_ESCAPE
from os import getenv
from pony.flask import Pony
from pony.orm import Database
from .misaka import MisakaRenderer
from .views import views
from .vk import vk_api


app = Flask(__name__, static_url_path=f"{getenv('URL_PREFIX', '')}/static")
app.config.db_schema = getenv('DB_SCHEMA')
app.config.title = getenv('CIPRESS_TITLE')
app.config.company = getenv('CIPRESS_COMPANY')
app.config.posts_per_page = getenv('CIPRESS_PAGE', 12)
app.config.SECRET_KEY = getenv('SECRET_KEY', 'development')
app.config.yandex = getenv('YANDEX')

app.register_blueprint(views, url_prefix=getenv('URL_PREFIX', '/'))

vk_secret = getenv('VK_CALLBACK_SECRET')
vk_token = getenv('VK_CALLBACK_TOKEN')
vk_author = getenv('VK_CALLBACK_AUTHOR', 1)
vk_category = getenv('VK_CALLBACK_CATEGORY', 1)
if vk_secret and vk_token:
    app.config.vk_secret = vk_secret
    app.config.vk_token = vk_token
    app.config.vk_author = vk_author
    app.config.vk_category = vk_category
    app.register_blueprint(vk_api, url_prefix=getenv('URL_PREFIX', '') + '/vk/')


Misaka(app, renderer=MisakaRenderer(flags=0 | HTML_ESCAPE), tables=True, autolink=True,
       underline=True, math=True, strikethrough=True, superscript=True, footnotes=True)

Pony(app)
db = Database()
LazyEntityMeta.attach(db, schema=app.config.db_schema)
db.bind('postgres', user=getenv('DB_USER', 'postgres'), password=getenv('DB_PASS', 'postgres'),
        host=getenv('DB_HOST', 'localhost'), database=getenv('DB_NAME', 'postgres'), port=getenv('DB_PORT', 5432))
db.generate_mapping(create_tables=False)

__all__ = ['app']
