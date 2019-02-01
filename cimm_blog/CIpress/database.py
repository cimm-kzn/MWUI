# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of cimm_blog.
#
#  cimm_blog is free software; you can redistribute it and/or modify
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
from LazyPony import LazyEntityMeta
from pony.orm import PrimaryKey, Required, Set


class Post(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    title = Required(str)
    body = Required(str)
    banner = Required(str, default='empty_banner.jpg')

    date = Required(datetime, default=datetime.utcnow)
    author = Required('Author')
    views = Required(int, default=0)
    category = Required('Category')
    tags = Set('Tag')


class Author(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    avatar = Required(str, default='empty_avatar.jpg')
    posts = Set('Post')


class Tag(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    posts = Set('Post', table='PostTag')


class Category(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    posts = Set('Post')


__all__ = ['Post', 'Author', 'Tag', 'Category']
