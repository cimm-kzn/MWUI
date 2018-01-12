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
from flask import request
from flask_login import current_user
from flask_restful import reqparse, marshal
from flask_restful.inputs import positive
from functools import wraps
from .redis import RedisCombiner
from ..common import abort
from ...config import REDIS_HOST, REDIS_JOB_TIMEOUT, REDIS_PASSWORD, REDIS_PORT, REDIS_TTL, RESULTS_PER_PAGE
from ...constants import AdditiveType


redis = RedisCombiner(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, result_ttl=REDIS_TTL,
                      job_timeout=REDIS_JOB_TIMEOUT, chunks=RESULTS_PER_PAGE)


results_fetch = reqparse.RequestParser(bundle_errors=True)
results_fetch.add_argument('page', type=positive,
                           help='Page number of results. by default all pages return. {error_msg}')


def request_arguments_parser(parser):
    """
    parse arguments of requests and pass it as function keyword arguments
    :param parser: RequestParser
    """
    def dec(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            parsed_kwargs = parser.parse_args()
            return f(*args, **kwargs, **parsed_kwargs)

        return wrapper
    return dec


def request_json_parser(resource_fields):
    def dec(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = marshal(request.get_json(force=True), resource_fields)
            return f(*args, data=data, **kwargs)

        return wrapper
    return dec


def fetch_task(status):
    """
    decorate methods which use redis tasks

    function should take next arguments:
        task, *args, job=x, ended_at=y, **kwargs

    decorator requires task argument and optional page keyword argument

    :param status: TaskStatus
    """
    def dec(f):
        @wraps(f)
        def wrapper(self, task, *args, page=None, **kwargs):
            job = redis.fetch_job(task, page=page)
            if job is None:
                abort(404, message='invalid task id. perhaps this task has already been removed')

            if not job:
                abort(500, message='modeling server error')

            if not job['is_finished']:
                abort(512, message='PROCESSING.Task not ready')

            if job['result']['status'] != status:
                abort(406, message='task status is invalid. task status is [%s]' % job['result']['status'].name)

            if job['result']['user'] != current_user.id:
                abort(403, message='user access deny. you do not have permission to this task')

            return f(self, task, *args, job=job['result'], ended_at=job['ended_at'], **kwargs)
        return wrapper
    return dec


def additives_check(check, additives):
    alist = []
    for a in check or []:
        ai = a['additive']
        if ai in additives and (0 < a['amount'] <= 1 if additives[ai]['type'] == AdditiveType.SOLVENT
                                else a['amount'] > 0):
            alist.append(dict(amount=a['amount'], **additives[ai]))
    return alist
