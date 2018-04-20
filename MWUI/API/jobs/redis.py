# -*- coding: utf-8 -*-
#
#  Copyright 2016-2018 Ramil Nugmanov <stsouko@live.ru>
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
from collections import defaultdict
from datetime import datetime
from pickle import dumps, loads
from redis import Redis, ConnectionError
from rq import Queue
from uuid import uuid4
from ...constants import TaskStatus, StructureStatus, ModelType, TaskType, ResultType


class RedisCombiner:
    def __init__(self, host='localhost', port=6379, password=None, result_ttl=86400, job_timeout=3600, chunks=50):
        self.__result_ttl = result_ttl
        self.__job_timeout = job_timeout
        self.__chunks = chunks
        self.__tasks = Redis(host=host, port=port, password=password)

    @property
    def connection(self):
        return self.__tasks

    def __new_worker(self, destinations):
        for x in destinations:
            q = self.__get_queue(x)
            if q is not None:
                return x, q  # todo: check for free machines. len(q) - number of tasks
        return None

    def __get_queue(self, destination):
        r = Redis(host=destination['host'], port=destination['port'], password=destination['password'])
        try:
            r.ping()
            return Queue(connection=r, name=destination['name'], default_timeout=self.__job_timeout)
        except ConnectionError:
            pass

    def new_file_job(self, file_url, model, user, _type=TaskType.MODELING):
        try:
            self.__tasks.ping()
        except ConnectionError:
            return None

        tmp = self.__new_worker(model['destinations'])
        if tmp is None:
            return None
        dest, worker = tmp

        try:
            _id = str(uuid4())
            job = dict(jobs=[(dest, worker.enqueue_call('redis_worker.convert',
                                                        kwargs={'structures': file_url, 'model': model['name']},
                                                        result_ttl=self.__result_ttl, meta={'task': _id}).id,
                              dict(type=model['type'], model=model['model'], name=model['name']))],
                       user=user, type=_type, status=TaskStatus.PREPARED, structures={})

            now = datetime.utcnow()
            self.__tasks.set(_id, dumps((job, now)), ex=self.__result_ttl)

            return dict(id=_id, created_at=now)
        except Exception as err:
            print("upload task ERROR:", err)

    def new_job(self, structures, user, _type=TaskType.MODELING, status=TaskStatus.PREPARING):
        try:
            self.__tasks.ping()
        except ConnectionError:
            return

        model_worker = {}
        model_struct = defaultdict(list)
        unused_structures = []

        for s in structures:
            # check for models in structures
            if status == TaskStatus.PROCESSING:
                if s['status'] != StructureStatus.CLEAR:  # modeling task. accept only clear structures.
                    continue
                models = [x for x in s['models'] if x['type'] != ModelType.PREPARER]
            else:
                if s['status'] == StructureStatus.RAW:  # preparing task. accept only raw structures.
                    models = [next(x for x in s['models'] if x['type'] == ModelType.PREPARER)]
                else:
                    if s['status'] == StructureStatus.CLEAR:  # clean structures in prepare task.
                        s = s.copy()
                        s['models'] = [dict(type=m['type'], model=m['model'], name=m['name']) for m in s['models']
                                       if m['type'] != ModelType.PREPARER]
                        unused_structures.append(s)   # store in redis unused structures.
                    continue  # remove structures with errors in any tasks.

            s = s.copy()
            s.pop('models')
            failed = []
            for model in models:
                dest = model['destinations']
                m = model['model']
                if (model_worker.get(m) or model_worker.setdefault(m, (self.__new_worker(dest), model)))[0] is not None:
                    model_struct[m].append(s)
                else:
                    failed.append(dict(type=model['type'], model=model['model'], name=model['name'],
                                       results=[dict(type=ResultType.TEXT, key='Modeling Failed',
                                                value='Modeling server not response')]))

            if failed:  # save failed models in structures.
                s['models'] = failed
                unused_structures.append(s)

        try:
            task_id = str(uuid4())
            jobs = [(dest, w.enqueue_call('redis_worker.run', kwargs={'structures': s, 'model': m['name']},
                                          result_ttl=self.__result_ttl, meta={'task': task_id}).id,
                     dict(type=m['type'], model=m['model'], name=m['name']))
                    for ((dest, w), m), s in ((model_worker[m], s) for m, s in model_struct.items())]

            tmp = {}
            for x in range(0, len(unused_structures), self.__chunks):  # store structures in chunks.
                _id = str(uuid4())
                chunk = {s['structure']: s for s in unused_structures[x: x + self.__chunks]}
                self.__tasks.set(_id, dumps(chunk), ex=self.__result_ttl)
                for s in chunk:
                    tmp[s] = _id

            job = dict(structures=tmp, jobs=jobs, user=user, type=_type,
                       status=TaskStatus.PROCESSED if status == TaskStatus.PROCESSING else TaskStatus.PREPARED)

            now = datetime.utcnow()
            self.__tasks.set(task_id, dumps((job, now)), ex=self.__result_ttl)
            return dict(id=task_id, created_at=now)
        except Exception as err:
            print("new_job ERROR:", err)

    def fetch_job(self, task, page=None):
        try:
            self.__tasks.ping()
        except ConnectionError:
            return False

        job = self.__tasks.get(task)
        if job is None:
            return

        result, ended_at = loads(job)

        if result['jobs']:
            return dict(is_finished=False)

        loaded_chunks = {}
        tmp = []
        if page is None:
            for s_id in sorted(result['structures']):
                ch_id = result['structures'][s_id]
                ch = loaded_chunks.get(ch_id) or loads(self.__tasks.get(ch_id))
                tmp.append(ch[s_id])
        else:
            chunks = sorted(set(result['structures'].values()))
            if page <= len(chunks):
                ch = loaded_chunks.get(chunks[page - 1]) or loads(self.__tasks.get(chunks[page - 1]))
                for s_id in sorted(ch):
                    tmp.append(ch[s_id])

        result['structures'] = tmp
        return dict(is_finished=True, ended_at=ended_at, result=result)

    def update_job(self, dest, subjob_id):
        self.__tasks.ping()

        job = self.__get_queue(dest).fetch_job(subjob_id)
        assert job.is_finished, 'not ready'

        task_id = job.meta['task']
        task, ended_at = loads(self.__tasks.get(task_id))

        model = next(model for _, x, model in task['jobs'] if x == subjob_id)

        loaded_chunks = {}
        chunks = defaultdict(list)
        for s_id, c_id in task['structures'].items():
            chunks[c_id].append(s_id)

        partial_chunk = next((k for k, v in chunks.items() if len(v) < self.__chunks), None)

        for s in job.result:
            results = [dict(results=s.pop('results', []), **model)]
            s_id = s['structure']
            if s_id in task['structures']:
                c_id = task['structures'][s_id]
                ch = loaded_chunks.get(c_id) or loaded_chunks.setdefault(c_id, loads(self.__tasks.get(c_id)))
                ch[s_id]['models'].extend(results)
            else:
                if partial_chunk:
                    ch = loaded_chunks.get(partial_chunk) or \
                         loaded_chunks.setdefault(partial_chunk, loads(self.__tasks.get(partial_chunk)))
                else:
                    partial_chunk = str(uuid4())
                    ch = loaded_chunks[partial_chunk] = {}

                s['models'] = results
                ch[s_id] = s
                task['structures'][s_id] = partial_chunk

                if len(ch) == self.__chunks:
                    partial_chunk = None

        ended_at = job.ended_at
        job.delete()

        for c_id, chunk in loaded_chunks.items():
            self.__tasks.set(c_id, dumps(chunk), ex=self.__result_ttl)

        task['jobs'] = tmp = [x for x in task['jobs'] if x[1] != subjob_id]
        self.__tasks.set(task_id, dumps((task, ended_at)), ex=self.__result_ttl)

        return not tmp and (task['user'], task_id)

    @staticmethod
    def user_channel(user):
        return 'jobs_%d' % user
