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
from flask_login import UserMixin
from pony.orm import PrimaryKey, Required, Optional
from uuid import UUID, uuid4
from ...database import LazyEntityMeta


class User(UserMixin, metaclass=LazyEntityMeta):
    id = PrimaryKey(int, auto=True)
    is_active = Required(bool, default=False, column='active')
    date = Required(datetime, default=datetime.utcnow)
    email = Required(str, unique=True)
    password = Required(bytes)
    token = Required(UUID, unique=True)
    restore = Optional(UUID, nullable=True)

    def __init__(self, email, password, **kwargs):
        password = hashpw(password.encode(), gensalt())
        token = self.get_unique_token()
        restore = self.get_restore_token()
        super().__init__(email=email, password=password, token=token, restore=restore, **kwargs)

    @classmethod
    def get_by_password(cls, email, password):
        x = cls.get(email=email)
        if x and x.password == hashpw(password.encode(), x.password):
            if x.restore:
                x.restore = None
            return x

    @classmethod
    def get_by_token(cls, token):
        return cls.get(token=token)

    @classmethod
    def get_unique_token(cls):
        while True:
            x = uuid4()
            if not cls.exists(token=x):
                return x

    def get_restore_token(self):
        while True:
            x = uuid4()
            if not self.exists(restore=x):
                self.restore = x
                return x

    def change_password(self, password):
        self.password = hashpw(password.encode(), gensalt())
        self.token = self.get_unique_token()

    def change_token(self):
        self.token = self.get_unique_token()

    def check_password(self, password):
        return self.password == hashpw(password.encode(), self.password)

    def get_id(self):
        # need for flask-login
        return self.token
