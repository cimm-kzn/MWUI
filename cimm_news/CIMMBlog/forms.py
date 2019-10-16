# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of CIMMBlog.
#
#  CIMMBlog is free software; you can redistribute it and/or modify
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
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from imghdr import what
from werkzeug.datastructures import FileStorage
from wtforms import StringField, BooleanField, SubmitField, ValidationError, TextAreaField, SelectField
from wtforms.validators import DataRequired


class VerifyImage:
    def __init__(self, types):
        self.__types = types

    def __call__(self, form, field):
        if isinstance(field.data, FileStorage) and field.data and what(field.data.stream) not in self.__types:
            raise ValidationError('Invalid image')


class EditPost(FlaskForm):
    title = StringField('Title', [DataRequired()])
    body = TextAreaField('Message', [DataRequired()])
    banner_field = FileField('Graphical Abstract',
                             validators=[FileAllowed('jpg jpe jpeg png'.split(), 'JPEG or PNG images only'),
                                         VerifyImage('jpeg png'.split())])
    category = SelectField('Category', [DataRequired()])
    tags_field = StringField('Tags')
    to_delete = BooleanField('Delete')
    submit_btn = SubmitField('Post')

    def __init__(self, *args, categories=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.category.choices = [(x.id, x.name) for x in categories]

    @property
    def tags(self):
        data = self.tags_field.data
        if data:
            return set(data.split())
        return set()
