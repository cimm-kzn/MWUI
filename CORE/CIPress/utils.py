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
from email.header import Header
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import request, current_app, render_template
from flask_misaka import markdown
from misaka import HtmlRenderer, HTML_ESCAPE
from redis import Redis, ConnectionError
from rq import Queue
from subprocess import Popen, PIPE
from urllib.parse import urlparse, urljoin


def is_safe_url(target):
    ref_url = urlparse(request.host_url)
    test_url = urlparse(urljoin(request.host_url, target))
    return test_url.scheme in ('http', 'https') and ref_url.netloc == test_url.netloc and test_url.path != request.path


def send_mail(message, subject, mail_to, mail_from=None, reply_to=None, attachments=None):
    r = Redis(**current_app.config.get('redis', {}))
    try:
        r.ping()
    except ConnectionError:
        return

    sender = Queue(connection=r, name=current_app.config['redis_mail'])
    msg = [f'Subject: {Header(subject).encode()}']
    if isinstance(mail_to, (tuple, list)):
        msg.append(f'To: {Header(mail_to[0]).encode()} <{mail_to[1]}>')
        mail_to = mail_to[1]
    else:
        msg.append(f'To: {mail_to}')

    if mail_from is None:
        mail_from = current_app.config["mail_from"]
    if isinstance(mail_from, (tuple, list)):
        msg.append(f'From: {Header(mail_from[0]).encode()} <{mail_from[1]}>')
    else:
        msg.append(f'From: {mail_from}')

    if reply_to:
        if isinstance(reply_to, (tuple, list)):
            msg.append(f'Reply-To: {Header(reply_to[0]).encode()} <{reply_to[1]}>')
        else:
            msg.append(f'Reply-To: {reply_to}')

    mp = MIMEMultipart('alternative')
    mp.attach(MIMEText(message, 'plain'))
    mp.attach(MIMEText(render_template('email.html',
                                       message=markdown(message, renderer=HtmlRenderer(flags=0 | HTML_ESCAPE),
                                                        underline=True, math=True, strikethrough=True, superscript=True,
                                                        tables=True, footnotes=True, autolink=True)), 'html'))

    if attachments:
        mmp = MIMEMultipart('mixed')
        mmp.attach(mp)
        mp = mmp

        for name, data in attachments.items():
            ma = MIMEApplication(data, name=name)
            ma['Content-Disposition'] = f'attachment; filename="{name}"'
            mp.attach(ma)

    sign = current_app.config.get('mail_sign')
    if sign:
        p = Popen(['openssl', 'smime', '-sign', '-inkey', sign[0], '-signer', sign[1]], stdin=PIPE, stdout=PIPE)
        msg.append(p.communicate(input=mp.as_bytes())[0].decode())
    else:
        msg.append(mp.as_string())

    return sender.enqueue_call('redis_mail.run', args=(mail_to, '\n'.join(msg)), result_ttl=60, timeout=60).id
