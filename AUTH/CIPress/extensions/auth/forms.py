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
from flask_login import current_user
from flask_wtf import FlaskForm
from pony.orm import db_session
from wtforms import StringField, BooleanField, SubmitField, PasswordField, ValidationError
from wtforms.validators import DataRequired, Email as ValidatorEmail
from .database import User


class CheckUserExist:
    def __call__(self, form, field):
        with db_session:
            if not User.exists(email=field.data.lower()):
                raise ValidationError('User not found')


class CheckUserFree:
    def __call__(self, form, field):
        with db_session:
            if User.exists(email=field.data.lower()):
                raise ValidationError('User exist. Please Log in or if you forgot password use restore procedure')


class VerifyPassword:
    def __call__(self, form, field):
        with db_session:
            if not current_user.get_user().check_password(field.data):
                raise ValidationError('Bad password')


class AuthForm(FlaskForm):
    email = StringField('Email', [DataRequired(), ValidatorEmail(), CheckUserExist()])
    password = PasswordField('Password', [DataRequired()])
    remember = BooleanField('Remember me')
    submit_btn = SubmitField('Enter')


class RegistrationForm(FlaskForm):
    email = StringField('Email', [DataRequired(), ValidatorEmail(), CheckUserFree()])
    password = PasswordField('Password', [DataRequired()])
    remember = BooleanField('Remember me')
    submit_btn = SubmitField('Enter')


class LogoutForm(FlaskForm):
    submit_btn = SubmitField('Log Out')


class LogoutAllForm(FlaskForm):
    password = PasswordField('Password', [DataRequired(), VerifyPassword()])
    submit_btn = SubmitField('Log Out')


class ChangePasswordForm(FlaskForm):
    old_password = PasswordField('Old Password', [DataRequired(), VerifyPassword()])
    password = PasswordField('Password', [DataRequired()])
    submit_btn = SubmitField('Change Password')


class ForgotPasswordForm(FlaskForm):
    email = StringField('Email', [DataRequired(), ValidatorEmail()])
    submit_btn = SubmitField('Send Email')


class NewPasswordForm(FlaskForm):
    password = StringField('New Password', [DataRequired()])
    submit_btn = SubmitField('Enter')
