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
from bcrypt import hashpw, gensalt
from datetime import datetime
from pony.orm import PrimaryKey, Required, Optional
from uuid import UUID, uuid4
from ..database import LazyEntityMeta


class User(metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    active = Required(bool, default=True)
    date = Required(datetime, default=datetime.utcnow)
    email = Required(str, unique=True)
    password = Required(bytes)
    token = Required(UUID, unique=True)
    restore = Optional(UUID, nullable=True)

    def __init__(self, email, password, **kwargs):
        password = hashpw(password.encode(), gensalt())
        token = self.get_unique_token()
        super().__init__(email=email, password=password, token=token, **kwargs)

    @classmethod
    def get_by_password(cls, email, password):
        x = cls.get(email=email)
        if x and x.password == hashpw(password, x.password):
            if x.restore:
                x.restore = None
            return x

    @classmethod
    def get_by_token(cls, token):
        return cls.get(token=token)

    @classmethod
    def get_by_restore(cls, email, restore, password):
        x = cls.get(email=email)
        if x and x.restore and x.restore == restore:
            x.password = hashpw(password.encode(), gensalt())
            x.token = cls.get_unique_token()
            x.restore = None
            return x

    @classmethod
    def get_unique_token(cls):
        while True:
            x = uuid4()
            if not cls.exists(token=x):
                return x

    @classmethod
    def get_restore_token(cls, email):
        x = cls.get(email=email)
        if x:
            restore = x.restore = uuid4()
            return restore

    def change_password(self, password):
        self.password = hashpw(password.encode(), gensalt())

    def change_token(self):
        self.token = self.get_unique_token()
