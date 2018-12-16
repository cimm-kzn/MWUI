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
from flask import current_app, request
from flask_login import LoginManager, current_user
from flask_nav.elements import View, Subgroup, Separator
from pony.orm import db_session
from .database import User
from .views import bp
from ...utils import is_safe_url


@db_session
def load_user(token):
    return User[current_app.config['schema']].get_by_token(token)


def init_login(state):
    lm = LoginManager()
    lm.login_view = 'auth.login'
    lm.user_loader(load_user)
    lm.init_app(state.app)


bp.record_once(init_login)


def auth_nav():
    if current_user.is_authenticated:
        return Subgroup(current_user.email,
                        View('Logout', 'auth.logout'), Separator(),
                        View('Logout everywhere', 'auth.logout_all'),
                        View('Change password', 'auth.change_password'))

    target = request.args.get('next')
    if not target or not is_safe_url(target):
        target = request.path
    return Subgroup('Login',
                    View('Login', 'auth.login', next=target),
                    View('Register', 'auth.register', next=target), Separator(),
                    View('Forgot password?', 'auth.forgot', next=target))


nav = (auth_nav, True)
