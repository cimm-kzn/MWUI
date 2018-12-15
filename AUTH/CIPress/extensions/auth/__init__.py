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
from flask import current_app
from flask_login import LoginManager
from pony.orm import db_session
from .database import User
from .views import bp


@db_session
def load_user(token):
    return User[current_app.config['schema']].get_by_token(token)


def init_login(state):
    lm = LoginManager()
    lm.login_view = 'auth.login'
    lm.user_loader(load_user)
    lm.init_app(state.app)


bp.record_once(init_login)
