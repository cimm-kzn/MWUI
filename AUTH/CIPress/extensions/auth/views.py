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
from flask import Blueprint, redirect, url_for, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from pony.orm import db_session
from .database import User
from .forms import RegistrationForm
from ...utils import is_safe_url, send_mail


bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=('GET', 'POST'))
@db_session
def register():
    target = request.args.get('next')
    if not target or not is_safe_url(target):
        target = redirect(url_for('main.index'))

    if current_user.is_authenticated:
        return target

    form = RegistrationForm()
    if form.validate_on_submit():
        u = User(email=form.email.data.lower(), password=form.password.data)
        send_mail(mail_to=u.email, **current_app.config['registration_mail'])
        login_user(u, remember=form.remember.data)
        return target
