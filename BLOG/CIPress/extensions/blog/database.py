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
from datetime import datetime
from pony.orm import PrimaryKey, Required, Optional, Set
from ...database import LazyEntityMeta, DoubleLink


class Post(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    title = Required(str)
    body = Required(str)
    glyph = Required(str, default='file')
    date = Required(datetime, default=datetime.utcnow)
    banner = Optional(str)
    attachments = Set('Attachment')
    slug = Optional(str, unique=True)
    author = Required('Author')


class Attachment(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    file = Required(str)
    name = Required(str)
    post = Required('Post')


class Author(metaclass=LazyEntityMeta):
    id = DoubleLink(PrimaryKey('User', reverse='blog'), Optional('Author'))
    name = Required(str)
    surname = Required(str)
    posts = Set('Post')

    @property
    def full_name(self):
        return f'{self.name} {self.surname}'
