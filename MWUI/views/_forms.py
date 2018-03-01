# -*- coding: utf-8 -*-
#
#  Copyright 2016-2018  Ramil Nugmanov <stsouko@live.ru>
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
from collections import OrderedDict
from flask import url_for, redirect
from flask_login import current_user
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from imghdr import what
from itertools import chain
from pony.orm import db_session
from pycountry import countries
from werkzeug.datastructures import FileStorage
from wtforms import (StringField, BooleanField, SubmitField, PasswordField, ValidationError, Form, FormField, FieldList,
                     TextAreaField, SelectField, HiddenField, IntegerField, DateTimeField, SelectMultipleField)
from wtforms.validators import DataRequired, Optional, EqualTo, Email as ValidatorEmail, NumberRange
from ._redirect import get_redirect_target, is_safe_url
from ..constants import (BlogPostType, UserRole, ThesisPostType, ProfileDegree, ProfileStatus, MeetingPostType,
                         EmailPostType, TeamPostType, MeetingPartType)
from ..models import User, Meeting


class CheckMeetingExist:
    def __call__(self, form, field):
        with db_session:
            if not Meeting.exists(id=field.data, _type=MeetingPostType.MEETING.value):
                raise ValidationError('Bad meeting post id')


class CheckUserFree:
    def __call__(self, form, field):
        with db_session:
            if User.exists(email=field.data.lower()):
                raise ValidationError('User exist. Please Log in or if you forgot password use restore procedure')


class CheckUserExist:
    def __call__(self, form, field):
        with db_session:
            if not User.exists(email=field.data.lower()):
                raise ValidationError('User not found')


class VerifyPassword:
    def __call__(self, form, field):
        with db_session:
            user = User.get(id=current_user.id)
            if not user or not user.verify_password(field.data):
                raise ValidationError('Bad password')


class VerifyImage:
    def __init__(self, types):
        self.__types = types

    def __call__(self, form, field):
        if isinstance(field.data, FileStorage) and field.data and what(field.data.stream) not in self.__types:
            raise ValidationError('Invalid image')


class CustomForm(FlaskForm):
    next = HiddenField()
    _order = None

    @staticmethod
    def reorder(order, prefix=None):
        return ['%s-%s' % (prefix, x) for x in order] if prefix else list(order)

    def __iter__(self):
        collect = OrderedDict((x.name, x) for x in super(CustomForm, self).__iter__())
        for name in self._order or collect:
            yield collect[name]

    def __init__(self, *args, **kwargs):
        super(CustomForm, self).__init__(*args, **kwargs)
        if not self.next.data:
            self.next.data = get_redirect_target()

    def redirect(self, endpoint='.index', **values):
        if self.next.data and is_safe_url(self.next.data):
            return redirect(self.next.data)

        return redirect(url_for(endpoint, **values))


class DeleteButtonForm(CustomForm):
    submit_btn = SubmitField('Delete')


class ProfileForm(CustomForm):
    name = StringField('Name', [DataRequired()])
    surname = StringField('Surname', [DataRequired()])
    banner_field = FileField('Photo', validators=[FileAllowed('jpg jpe jpeg png'.split(), 'JPEG or PNG images only'),
                                                  VerifyImage('jpeg png'.split())])
    degree = SelectField('Degree', [DataRequired()], choices=[(x.value, x.fancy) for x in ProfileDegree],
                         coerce=int)
    status = SelectField('Status', [DataRequired()], choices=[(x.value, x.fancy) for x in ProfileStatus],
                         coerce=int)

    country = SelectField('Country', [DataRequired()], choices=[(x.alpha_3, x.name) for x in countries])
    town = StringField('Town')
    affiliation = StringField('Affiliation')
    position = StringField('Position')

    submit_btn = SubmitField('Update Profile')


class Email(CustomForm):
    email = StringField('Email', [DataRequired(), ValidatorEmail(), CheckUserExist()])


class Password(CustomForm):
    password = PasswordField('Password', [DataRequired(), EqualTo('confirm', message='Passwords must match')])
    confirm = PasswordField('Repeat Password', [DataRequired()])


class RegistrationForm(ProfileForm, Password):
    email = StringField('Email', [DataRequired(), ValidatorEmail(), CheckUserFree()])
    submit_btn = SubmitField('Register')

    __order = ('csrf_token', 'next', 'email', 'password', 'confirm', 'name', 'surname', 'degree',
               'status', 'country', 'town', 'affiliation', 'position', 'submit_btn')

    def __init__(self, *args, **kwargs):
        self._order = self.reorder(self.__order, kwargs.get('prefix'))
        super(RegistrationForm, self).__init__(*args, **kwargs)


class LoginForm(Email):
    password = PasswordField('Password', [DataRequired()])
    remember = BooleanField('Remember me')
    submit_btn = SubmitField('Log in')


class ReLoginForm(CustomForm):
    password = PasswordField('Password', [DataRequired(), VerifyPassword()])
    submit_btn = SubmitField('Log out')


class ChangePasswordForm(Password):
    old_password = PasswordField('Old Password', [DataRequired(), VerifyPassword()])
    submit_btn = SubmitField('Change Password')


class ForgotPasswordForm(CustomForm):
    email = StringField('Email', [DataRequired(), ValidatorEmail()])
    submit_btn = SubmitField('Restore')


class LogoutForm(CustomForm):
    submit_btn = SubmitField('Log out')


class ChangeRoleForm(Email):
    role_type = SelectField('Role Type', [DataRequired()],
                            choices=[(x.value, x.name) for x in UserRole], coerce=int)
    submit_btn = SubmitField('Change Role')

    @property
    def type(self):
        return UserRole(self.role_type.data)


class BanUserForm(Email):
    submit_btn = SubmitField('Ban User')


class MeetForm(CustomForm):
    part_type = SelectField('Participation Type', [DataRequired()],
                            choices=[(x.value, x.fancy) for x in MeetingPartType], coerce=int)
    submit_btn = SubmitField('Confirm')

    def __init__(self, *args, types=None, **kwargs):
        super(MeetForm, self).__init__(*args, **kwargs)
        if types is not None:
            self.part_type.choices = [(x.value, x.fancy) for x in types]

    @property
    def type(self):
        return MeetingPartType(self.part_type.data)


class CommonPost(CustomForm):
    title = StringField('Title', [DataRequired()])
    body = TextAreaField('Message', [DataRequired()])
    banner_field = FileField('Graphical Abstract',
                             validators=[FileAllowed('jpg jpe jpeg png'.split(), 'JPEG or PNG images only'),
                                         VerifyImage('jpeg png'.split())])
    attachment = FileField('Abstract File', validators=[FileAllowed('doc docx odt pdf'.split(), 'Documents only')])
    to_delete = BooleanField('Delete')

    def __init__(self, order, *args, **kwargs):
        self._order = self.reorder(chain(order, ('to_delete',)) if kwargs.get('admin') else order, kwargs.get('prefix'))
        super(CommonPost, self).__init__(*args, **kwargs)


class Authors(Form):
    first_name = StringField('First Name', [DataRequired()])
    second_name = StringField('Second Name', [DataRequired()])
    affiliation = IntegerField('Affiliation Number', [DataRequired(), NumberRange(min=1)])


class Affiliations(Form):
    affiliation = StringField('Organization', [DataRequired()])
    town = StringField('Town', [DataRequired()])
    country = SelectField('Country', [DataRequired()], choices=[(x.alpha_3, x.name) for x in countries])


class ThesisForm(CommonPost):
    post_type = SelectField('Presentation Type', [DataRequired()],
                            choices=[(x.value, x.fancy) for x in ThesisPostType], coerce=int)
    authors = FieldList(FormField(Authors), min_entries=1)
    affiliations = FieldList(FormField(Affiliations), min_entries=1)
    submit_btn = SubmitField('Confirm')

    __order = ('csrf_token', 'next', 'title', 'body', 'banner_field', 'attachment', 'post_type', 'authors',
               'affiliations', 'submit_btn')

    def __init__(self, *args, body_name=None, types=None, **kwargs):
        super(ThesisForm, self).__init__(self.__order, *args, **kwargs)
        if types is not None:
            self.post_type.choices = [(x.value, x.fancy) for x in types]
        self.body.label.text = body_name or 'Short Abstract'
        for n, x in enumerate(self.affiliations.entries, start=1):
            x.label.text = 'Affiliation: %d' % n
        for n, x in enumerate(self.authors.entries, start=1):
            x.label.text = 'Author: %d' % n

    @property
    def type(self):
        return ThesisPostType(self.post_type.data)

    def affiliations_validate(self):
        flag = True
        for x in self.authors:
            if x.affiliation.data > len(self.affiliations):
                x.affiliation.errors = ['Affiliation number out of list']
                flag = False
        return flag


class Post(CommonPost):
    slug = StringField('Slug')
    submit_btn = SubmitField('Post')


class PostForm(Post):
    post_type = SelectField('Post Type', [DataRequired()],
                            choices=[(x.value, x.name) for x in BlogPostType], coerce=int)

    __order = ('csrf_token', 'next', 'title', 'body', 'slug', 'banner_field', 'attachment', 'post_type', 'submit_btn')

    def __init__(self, *args, **kwargs):
        super(PostForm, self).__init__(self.__order, *args, **kwargs)

    @property
    def type(self):
        return BlogPostType(self.post_type.data)


class MeetingForm(Post):
    post_type = SelectField('Post Type', [DataRequired()],
                            choices=[(x.value, x.name) for x in MeetingPostType], coerce=int)
    thesis_count = IntegerField('Posters Count', [Optional()])
    deadline = DateTimeField('Deadline', [Optional()], format='%d/%m/%Y %H:%M')
    thesis_deadline = DateTimeField('Poster Deadline', [Optional()], format='%d/%m/%Y %H:%M')
    meeting_id = IntegerField('Meeting page', [Optional(), CheckMeetingExist()])
    order = IntegerField('Order', [Optional()])
    body_name = StringField('Body Name')
    participation_types_id = SelectMultipleField('Participation Types', [Optional()],
                                                 choices=[(x.value, x.name) for x in MeetingPartType], coerce=int)
    thesis_types_id = SelectMultipleField('Presentation Types', [Optional()],
                                          choices=[(x.value, x.name) for x in ThesisPostType], coerce=int)

    __order = ('csrf_token', 'next', 'title', 'body', 'slug', 'banner_field', 'attachment', 'post_type', 'thesis_count',
               'deadline', 'thesis_deadline', 'meeting_id', 'order', 'body_name', 'participation_types_id',
               'thesis_types_id', 'submit_btn')

    def __init__(self, *args, **kwargs):
        super(MeetingForm, self).__init__(self.__order, *args, **kwargs)

    @property
    def type(self):
        return MeetingPostType(self.post_type.data)

    @property
    def participation_types(self):
        return [MeetingPartType(x) for x in self.participation_types_id.data] or None

    @property
    def thesis_types(self):
        return [ThesisPostType(x) for x in self.thesis_types_id.data] or None


class EmailForm(Post):
    post_type = SelectField('Post Type', [DataRequired()],
                            choices=[(x.value, x.name) for x in EmailPostType], coerce=int)
    from_name = StringField('From Name')
    reply_name = StringField('Reply Name')
    reply_mail = StringField('Reply email', [Optional(), ValidatorEmail()])
    meeting_id = IntegerField('Meeting page', [Optional(), CheckMeetingExist()])

    __order = ('csrf_token', 'next', 'title', 'body', 'slug', 'banner_field', 'attachment', 'post_type', 'from_name',
               'reply_mail', 'reply_name', 'meeting_id', 'submit_btn')

    def __init__(self, *args, **kwargs):
        super(EmailForm, self).__init__(self.__order, *args, **kwargs)

    @property
    def type(self):
        return EmailPostType(self.post_type.data)


class TeamForm(Post):
    post_type = SelectField('Member Type', [DataRequired()],
                            choices=[(x.value, x.name) for x in TeamPostType], coerce=int)
    role = StringField('Role', [DataRequired()])
    order = IntegerField('Order', [Optional()])
    scopus = StringField('Scopus')

    __order = ('csrf_token', 'next', 'title', 'body', 'slug', 'banner_field', 'attachment', 'post_type', 'role',
               'order', 'scopus', 'submit_btn')

    def __init__(self, *args, **kwargs):
        super(TeamForm, self).__init__(self.__order, *args, **kwargs)

    @property
    def type(self):
        return TeamPostType(self.post_type.data)
