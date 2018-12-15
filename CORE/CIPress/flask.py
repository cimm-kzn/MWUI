# -*- coding: utf-8 -*-
#
#  Copyright 2018 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of CIPress.
#
#  CIPress is free software; you can redistribute it and/or modify
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
from flask_bootstrap import Bootstrap
from flask_nav import Nav, register_renderer
from flask_resize import Resize
from importlib import import_module
from pkgutil import iter_modules
from pony.orm import Database
from . import extensions
from .navbar import CIPressRenderer, NavBar
from .database import LazyEntityMeta


def init(config):
    app = Flask(__name__)
    app.jinja_env.globals.update(copyright=config['copyright'], yandex=config.get('yandex'))
    app.config.update(config)

    nav_bar = NavBar()
    nav = Nav(app)
    nav.register_element('nav_bar', nav_bar)
    register_renderer(app, 'CIPress', CIPressRenderer)

    Resize(app)
    Bootstrap(app)

    for module_info in iter_modules(extensions.__path__):
        if module_info.ispkg:
            module = import_module(f'CIPress.extensions.{module_info.name}')
            if hasattr(module, 'bp'):
                app.register_blueprint(module.bp)
                if hasattr(module, 'nav'):
                    nav_bar.register(*module.nav)

    db = Database()
    LazyEntityMeta.attach(db, config['schema'])
    db.bind(**config.pop('database'))
    db.generate_mapping(create_tables=False)
    return app
