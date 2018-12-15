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
from flask import Blueprint, render_template, current_app
from pony.orm import db_session, desc
from .database import Carousel


bp = Blueprint('main', __name__, template_folder='templates')


@bp.route('/', methods=('GET',))
@db_session
def index():
    carousel = Carousel[current_app.config['schema']].select().order_by(lambda x: desc(x.date)).limit(5)
    return render_template('main/index.html', carousel=carousel)
