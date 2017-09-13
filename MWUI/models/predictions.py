# -*- coding: utf-8 -*-
#
#  Copyright 2017 Ramil Nugmanov <stsouko@live.ru>
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
from pony.orm import PrimaryKey, Required, Optional, Set, Json
from ..config import DEBUG
from ..constants import TaskType, ResultType, StructureType, StructureStatus, ModelType, AdditiveType
from ..utils import filter_kwargs, jsonify_structures


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
                       type=example['type'].value,
                       additives=[dict(name=x['name'], amount=x['amount']) for x in example['additives']])
            super().__init__(_type=_type, _example=tmp, **filter_kwargs(kwargs))

        @property
        def type(self):
            return ModelType(self._type)

        @property
        def example(self):
            return self._get_example()

        def _get_example(self, skip_models=False, raw=False):
            additives = {a.name: dict(additive=a.id, name=a.name, structure=a.structure,
                                      type=a._type if raw else a.type) for a in Additive.select()}
            tmp = self._example.copy()
            alist = []
            for a in tmp['additives']:
                ai = a['name']
                if ai in additives:
                    alist.append(dict(amount=a['amount'], **additives[ai]))

            if raw:
                tmp.update(type=tmp['type'], status=StructureStatus.CLEAR.value)
            else:
                tmp.update(type=StructureType(tmp['type']), status=StructureStatus.CLEAR)

            tmp.update(structure=1, additives=alist,
                       models=[dict(type=self._type if raw else self.type, model=self.id, name=self.name,
                                    destinations=self.destinations)] if not skip_models else [])
            return tmp

        @classmethod
        def get_models_dict(cls, skip_prep=True, skip_destinations=False, skip_example=True, raw=False):
            res = {}
            for m in cls.select(lambda x: x._type != ModelType.PREPARER.value) if skip_prep else cls.select():
                res[m.id] = tmp = dict(model=m.id, name=m.name, description=m.description,
                                       type=m._type if raw else m.type)
                if not skip_destinations:
                    tmp['destinations'] = m.destinations
                if not skip_example:
                    tmp['example'] = m._get_example(skip_models=True, raw=raw)
            return res

        @classmethod
        def get_preparer_model(cls, raw=False):
            return next(dict(model=m.id, name=m.name, description=m.description, type=m._type if raw else m.type,
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
        def get_additives_dict(cls, key='id', raw=False):
            return {getattr(a, key): dict(additive=a.id, name=a.name, structure=a.structure,
                                          type=a._type if raw else a.type)
                    for a in cls.select()}

    class Task(db.Entity):
        _table_ = '%s_task' % schema if DEBUG else (schema, 'task')
        id = PrimaryKey(int, auto=True)
        date = Required(datetime, default=datetime.utcnow)
        _type = Required(int, column='type')
        user = Required('User')
        _data = Required(Json, column='data')

        def __init__(self, structures, **kwargs):
            _type = kwargs.pop('type', TaskType.MODELING).value
            super().__init__(_type=_type, _data=jsonify_structures(structures), **kwargs)

        @property
        def type(self):
            return TaskType(self._type)

        def get_data(self, raw=False):
            if not raw:
                out = []
                for s in self._data:
                    out.append(dict(status=StructureStatus(s['status']), type=StructureType(s['type']),
                                    structure=s['structure'],
                                    data=s['data'], pressure=s['pressure'], temperature=s['temperature'],
                                    additives=[dict(additive=a['additive'], name=a['name'], structure=a['structure'],
                                                    type=AdditiveType(a['type']), amount=a['amount'])
                                               for a in s['additives']],
                                    models=[dict(type=ModelType(m['type']), model=m['model'], name=m['name'],
                                                 results=[dict(type=ResultType(r['type']), key=r['key'],
                                                               value=r['value'])
                                                          for r in m['results']]) for m in s['models']]))
                return out
            return self._data

    return Task, Model, Destination, Additive
