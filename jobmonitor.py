# -*- coding: utf-8 -*-
#
#  Copyright 2018 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of predictor.
#
#  predictor is free software; you can redistribute it and/or modify
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
from flask import url_for
from MWUI import init
from MWUI.API.jobs.redis import RedisCombiner
from MWUI.config import REDIS_HOST, REDIS_JOB_TIMEOUT, REDIS_PASSWORD, REDIS_PORT, REDIS_TTL, RESULTS_PER_PAGE
from MWUI.models import Destination
from pony.orm import db_session
from redis import Redis
from requests import post
from time import sleep

app = init()
app.config['SERVER_NAME'] = '127.0.0.1'

with db_session:
    dests = {(x.host, x.port): x.to_dict(['host', 'name', 'password', 'port']) for x in Destination.select()}

channels = []
for x in dests.values():
    r = Redis(host=x['host'], port=x['port'], password=x['password'])
    p = r.pubsub()
    p.subscribe('done_jobs')
    channels.append((x, p))

rq = RedisCombiner(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, result_ttl=REDIS_TTL,
                   job_timeout=REDIS_JOB_TIMEOUT, chunks=RESULTS_PER_PAGE)

print('JobMonitor Loaded')

while True:
    for x, p in channels:
        try:
            message = p.get_message()
            if message and message['type'] == 'message':
                data = message['data'].decode()
                print(data, x)
                res = rq.update_job(x, data)
                print(res)
                if res:
                    with app.app_context():
                        post(url_for('jobs.publish', channel=rq.user_channel(res[0])), data=res[1])
        except Exception as e:
            print(e)
    sleep(2)
