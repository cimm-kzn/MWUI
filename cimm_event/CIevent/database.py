# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of CIevent.
#
#  CIevent is free software; you can redistribute it and/or modify
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
from pony.orm import PrimaryKey, Required, Set, Optional


class Event(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    title = Required(str)
    abbr = Required(str)
    date = Required(datetime)
    participation = Required(bool, default=False)
    abstracts = Required(bool, default=False)
    registration_deadline = Optional(datetime)
    submission_deadline = Optional(datetime)
    pages = Set('Page')

    @property
    def ordered_pages(self):
        return sorted(self.pages, key=lambda x: x.order)


class Page(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    title = Required(str)
    body = Required(str, lazy=True)
    order = Required(int)
    event = Required('Event')


class Participant(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    email = Required(str, unique=True)
    password = Required(str)
    token = Required(str)
    restore = Optional(str)

    name = Required(str)
    surname = Required(str)
    degree = Required('Degree')
    status = Required('Status')
    country = Required('Country')
    town = Required('Town')
    affiliation = Required('Affiliation')
    position = Required('Position')


class Abstract(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    date = Required(datetime, default=datetime.utcnow)
    title = Required(str)
    body = Required(str)
    attachments = Set('Attachment')


class Attachment(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str)
    file = Required(str)
    abstract = Required('Abstract')


class Degree(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    participants = Set('Participant')


class Status(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    participants = Set('Participant')


class Affiliation(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    participants = Set('Participant')


class Position(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    participants = Set('Participant')


class Country(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    participants = Set('Participant')


class Town(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    name = Required(str, unique=True)
    participants = Set('Participant')


__all__ = ['Page', 'Event']
