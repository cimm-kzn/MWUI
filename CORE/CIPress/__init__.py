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
from flask_misaka import Misaka
from flask_nav import Nav, register_renderer
from flask_resize import Resize
from misaka import HTML_ESCAPE
from .bootstrap import CIPressRenderer, NavBar, MisakaRenderer
from .views import bp as main


def init(config):
    app = Flask(__name__)
    app.jinja_env.globals.update(copyright=config['copyright'], yandex=config.get('yandex'))
    app.config.update(config)
    nav = Nav(app)
    nav_bar = NavBar()
    nav.register_element('nav_bar', nav_bar)
    register_renderer(app, 'CIPress', CIPressRenderer)

    Resize(app)
    Bootstrap(app)
    Misaka(app, renderer=MisakaRenderer(flags=0 | HTML_ESCAPE), tables=True, autolink=True,
           underline=True, math=True, strikethrough=True, superscript=True, footnotes=True)

    app.register_blueprint(main, url_prefix='/')
    return app
