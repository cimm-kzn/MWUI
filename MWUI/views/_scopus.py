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
from pony.orm import db_session
from redis import Redis, ConnectionError
from rq import Queue
from ..config import REDIS_SCOPUS, SCOPUS_TTL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_JOB_TIMEOUT
from ..models import Author


def get_articles(author_id):
    r = Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD)
    try:
        r.ping()
    except ConnectionError:
        return None

    result = r.get('SCOPUS_%s' % author_id)
    if result:
        return result.decode()

    with db_session:
        a = Author.get(scopus_id=author_id)
        if not a:
            task = ('new', author_id)
            result = None
        else:
            task = ('update', a.id) if not a.is_fresh else None
            result = a.get_articles()

        if task:
            worker = Queue(connection=r, name=REDIS_SCOPUS, default_timeout=REDIS_JOB_TIMEOUT)
            worker.enqueue_call('redis_scopus.run', args=task, result_ttl=60)
        else:
            r.set('SCOPUS_%s' % author_id, result.encode(), ex=SCOPUS_TTL)

    return result
