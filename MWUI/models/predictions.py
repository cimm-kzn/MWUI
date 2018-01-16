# -*- coding: utf-8 -*-
#
#  Copyright 2017, 2018 Ramil Nugmanov <stsouko@live.ru>
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
from datetime import datetime
from flask_restful import marshal
from pony.orm import PrimaryKey, Required, Optional, Set, Json
from .utils import filter_kwargs
from ..API.structures import TaskStructureResponseFields, TaskStructureFields
from ..config import DEBUG
from ..constants import TaskType, StructureType, StructureStatus, ModelType, AdditiveType


def load_tables(db, schema):
    class Model(db.Entity):
        _table_ = '%s_model' % schema if DEBUG else (schema, 'model')
        id = PrimaryKey(int, auto=True)
        description = Optional(str)
        _destinations = Set('Destination')
        _example = Optional(Json, column='example')
        _type = Required(int, column='type')
        name = Required(str, unique=True)

        def __init__(self, example, **kwargs):
            _type = kwargs.pop('type', ModelType.MOLECULE_MODELING).value
            tmp = dict(data=example['data'], pressure=example['pressure'], temperature=example['temperature'],
                       type=example['type'].value, description=example['description'],
                       additives=[dict(name=x['name'], amount=x['amount']) for x in example['additives']])
            super().__init__(_type=_type, _example=tmp, **filter_kwargs(kwargs))

        @property
        def type(self):
            return ModelType(self._type)

        @property
        def example(self):
            return self._get_example()

        def _get_example(self, skip_models=False):
            additives = Additive.get_additives_dict('name')
            example = self._example.copy()

            alist = []
            for a in example['additives']:
                ai = a['name']
                if ai in additives:
                    alist.append(dict(amount=a['amount'], **additives[ai]))

            models = [dict(type=self.type, model=self.id, name=self.name,
                           destinations=self.destinations)] if not skip_models else []

            example.update(models=models, type=StructureType(example['type']), status=StructureStatus.CLEAR,
                           structure=1, additives=alist)
            return example

        @classmethod
        def get_models_dict(cls, skip_prep=True, skip_destinations=False, skip_example=True):
            res = {}
            for m in cls.select(lambda x: x._type != ModelType.PREPARER.value) if skip_prep else cls.select():
                res[m.id] = tmp = dict(model=m.id, name=m.name, description=m.description, type=m.type)
                if not skip_destinations:
                    tmp['destinations'] = m.destinations
                if not skip_example:
                    tmp['example'] = m._get_example(skip_models=True)
            return res

        @classmethod
        def get_preparer_model(cls):
            return next(dict(model=m.id, name=m.name, description=m.description, type=m.type,
                             destinations=m.destinations)
                        for m in cls.select(lambda x: x._type == ModelType.PREPARER.value))

        @property
        def destinations(self):
            return [dict(host=x.host, port=x.port, password=x.password, name=x.name) for x in self._destinations]

    class Destination(db.Entity):
        _table_ = '%s_destination' % schema if DEBUG else (schema, 'destination')
        id = PrimaryKey(int, auto=True)
        host = Required(str)
        model = Required('Model')
        name = Required(str)
        password = Optional(str)
        port = Required(int, default=6379)

        def __init__(self, **kwargs):
            super().__init__(**filter_kwargs(kwargs))

    class Additive(db.Entity):
        _table_ = '%s_additive' % schema if DEBUG else (schema, 'additive')
        id = PrimaryKey(int, auto=True)
        _type = Required(int, column='type')
        name = Required(str, unique=True)
        structure = Optional(str)

        def __init__(self, **kwargs):
            _type = kwargs.pop('type', AdditiveType.SOLVENT).value
            super().__init__(_type=_type, **kwargs)

        @property
        def type(self):
            return AdditiveType(self._type)

        @classmethod
        def get_additives_dict(cls, key='id'):
            return {getattr(a, key): dict(additive=a.id, name=a.name, structure=a.structure, type=a.type)
                    for a in cls.select()}

    class Task(db.Entity):
        _table_ = '%s_task' % schema if DEBUG else (schema, 'task')
        id = PrimaryKey(int, auto=True)
        task = Required(str, unique=True, sql_type='CHARACTER(36)')
        date = Required(datetime, default=datetime.utcnow)
        _type = Required(int, column='type')
        user = Required('User')
        _data = Required(Json, column='data', lazy=True)

        def __init__(self, structures, **kwargs):
            _type = kwargs.pop('type', TaskType.MODELING).value
            structures = marshal(structures, TaskStructureResponseFields.resource_fields)
            super().__init__(_type=_type, _data=structures, **kwargs)

        @property
        def type(self):
            return TaskType(self._type)

        def get_data(self):
            return marshal(self._data, TaskStructureFields.resource_fields)

    return Task, Model, Destination, Additive
