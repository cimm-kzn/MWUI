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
from flask_misaka import Misaka
from misaka import HtmlRenderer, HTML_ESCAPE
from .views import bp


class MisakaRenderer(HtmlRenderer):
    @staticmethod
    def table(content):
        return f'<table class="table">{content}</table>'


def init_misaka(state):
    Misaka(state.app, renderer=MisakaRenderer(flags=0 | HTML_ESCAPE), tables=True, autolink=True,
           underline=True, math=True, strikethrough=True, superscript=True, footnotes=True)


bp.record_once(init_misaka)
