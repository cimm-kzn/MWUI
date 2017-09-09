# -*- coding: utf-8 -*-
#
#  Copyright 2016 Ramil Nugmanov <stsouko@live.ru>
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
from ..constants import TaskStatus, StructureStatus, ModelType
from ..config import RESULTS_PER_PAGE


class RedisCombiner(object):
    def __init__(self, host='localhost', port=6379, password=None, result_ttl=86400, job_timeout=3600):
        self.__result_ttl = result_ttl
        self.__job_timeout = job_timeout

        self.__tasks = Redis(host=host, port=port, password=password)

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
            return None

    def new_file_job(self, task):
        if task['status'] != TaskStatus.NEW:
            return None  # for api check.

        try:
            self.__tasks.ping()
        except ConnectionError:
            return None

        s = task.pop('structures')
        model = task.pop('model')
        tmp = self.__new_worker(model['destinations'])
        if tmp is None:
            return None

        dest, worker = tmp

        try:
            task['jobs'] = [(dest, worker.enqueue_call('redis_worker.convert', kwargs={'structures': s, 'model': model},
                                                       result_ttl=self.__result_ttl).id)]
            task['status'] = TaskStatus.PREPARED
            task['structures'] = {}

            _id = str(uuid4())
            self.__tasks.set(_id, dumps((task, datetime.utcnow())), ex=self.__result_ttl)
            return dict(id=_id, created_at=datetime.utcnow())
        except Exception as err:
            print("upload task ERROR:", err)
            return None

    def new_job(self, task):
        if task['status'] not in (TaskStatus.NEW, TaskStatus.PREPARING, TaskStatus.MODELING):
            return None  # for api check.

        try:
            self.__tasks.ping()
        except ConnectionError:
            return None

        model_worker = {}
        model_struct = defaultdict(list)
        unused_structures = []

        for s in task['structures']:
            # check for models in structures
            if task['status'] == TaskStatus.MODELING and s['status'] == StructureStatus.CLEAR:
                # modeling task. accept only clear structures.
                models = [(x['model'], x) for x in s.pop('models') if x['type'] != ModelType.PREPARER]
            elif task['status'] in (TaskStatus.PREPARING, TaskStatus.NEW) and s['status'] == StructureStatus.RAW:
                # preparing task. accept only raw structures.
                models = [next((x['model'], x) for x in s.pop('models') if x['type'] == ModelType.PREPARER)]
            elif s['status'] == StructureStatus.HAS_ERROR:
                # remove models for structures with errors in any tasks.
                models = s['models'] = []
            else:  # clean structures in prepare task.
                for x in s['models']:
                    x.pop('destinations')
                models = []

            failed = []
            for m, model in models:
                dest = model.pop('destinations')
                if (model_worker.get(m) or model_worker.setdefault(m, (self.__new_worker(dest), model)))[0] is not None:
                    model_struct[m].append(s)
                else:
                    failed.append(model)

            if failed:  # save failed models in structures.
                s['models'] = failed
            if 'models' in s:  # store in redis failed or unused structures.
                unused_structures.append(s)

        new_job = ((w, {'structures': s, 'model': m}, m)
                   for (w, m), s in ((model_worker[m], s) for m, s in model_struct.items()))

        try:
            jobs = [(dest, w.enqueue_call('redis_worker.run', kwargs=d, result_ttl=self.__result_ttl).id, m)
                    for (dest, w), d, m in new_job]

            tmp = {}
            for x in range(0, len(unused_structures), RESULTS_PER_PAGE):  # store structures in chunks.
                _id = str(uuid4())
                chunk = {s['structure']: s for s in unused_structures[x: x + RESULTS_PER_PAGE]}
                self.__tasks.set(_id, dumps(chunk), ex=self.__result_ttl)
                for s in chunk:
                    tmp[s] = _id

            task['structures'] = tmp
            task['jobs'] = jobs
            task['status'] = TaskStatus.DONE if task['status'] == TaskStatus.MODELING else TaskStatus.PREPARED

            _id = str(uuid4())
            self.__tasks.set(_id, dumps((task, datetime.utcnow())), ex=self.__result_ttl)
            return dict(id=_id, created_at=datetime.utcnow())
        except Exception as err:
            print("new_job->ERROR:", err)
            return None

    def fetch_job(self, task, page=None):
        try:
            self.__tasks.ping()
        except ConnectionError:
            return False

        job = self.__tasks.get(task)
        if job is None:
            return None

        result, ended_at = loads(job)

        loaded_chunks = {}
        sub_jobs_fin = []
        sub_jobs_unf = []
        for dest, sub_task, model in result['jobs']:
            worker = self.__get_queue(dest)
            if worker is not None:  # skip lost workers
                tmp = worker.fetch_job(sub_task)
                if tmp is not None:
                    if tmp.is_finished:
                        sub_jobs_fin.append((tmp, model))
                    elif not tmp.is_failed:  # skip failed jobs
                        sub_jobs_unf.append((dest, sub_task, model))

        if sub_jobs_fin:
            chunks = defaultdict(list)
            for s_id, _id in result['structures'].items():
                chunks[_id].append(s_id)

            partial_chunk = next((k for k, v in chunks.items() if len(v) < RESULTS_PER_PAGE), None)

            for j, model in sub_jobs_fin:
                for s in j.result:
                    results = dict(results=s.pop('results', []), **model)
                    s_id = s['structure']
                    if s_id in result['structures']:
                        ch_id = result['structures'][s_id]
                        ch = loaded_chunks.get(ch_id) or loaded_chunks.setdefault(ch_id, loads(self.__tasks.get(ch_id)))
                        ch[s_id]['models'].extend([results])
                    else:
                        if partial_chunk:
                            ch = loaded_chunks.get(partial_chunk) or \
                                 loaded_chunks.setdefault(partial_chunk, loads(self.__tasks.get(partial_chunk)))
                        else:
                            partial_chunk = str(uuid4())
                            ch = loaded_chunks.setdefault(partial_chunk, {})

                        s['models'] = [results]
                        ch[s_id] = s
                        result['structures'][s_id] = partial_chunk

                        if len(ch) == RESULTS_PER_PAGE:
                            partial_chunk = None

                j.delete()

            for _id, chunk in loaded_chunks.items():
                self.__tasks.set(_id, dumps(chunk), ex=self.__result_ttl)

            result['jobs'] = sub_jobs_unf
            ended_at = max(x.ended_at for x, _ in sub_jobs_fin)

            self.__tasks.set(task, dumps((result, ended_at)), ex=self.__result_ttl)

        if sub_jobs_unf:
            return dict(is_finished=False)

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
