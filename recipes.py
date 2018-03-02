#!/usr/bin/env python3.4
# -*- coding: utf-8 -*-
#
#  Copyright 2017 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of predictor.
#
#  predictor 
#  is free software; you can redistribute it and/or modify
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

"""
Email SPAM sender.
"""
from MWUI import init
from pandas import read_csv
from MWUI.models import Email
from MWUI.views._sendmail import send_mail, attach_mixin


app = init()
data = read_csv('/path/to/addr.csv', sep=';', encoding='cp1251')
m = Email[123]
attach_files, attach_names = attach_mixin(m)

for _, x in data.iterrows():
    full_name = '%s %s' % (x['name'], x['surname'])
    with app.app_context():
        send_mail(m.body % full_name, x['e-mail'], to_name=full_name, title=m.title, subject=m.title, banner=m.banner,
                  from_name=m.from_name, reply_mail=m.reply_mail, reply_name=m.reply_name,
                  attach_files=attach_files, attach_names=attach_names)


"""
load abstracts
"""
from MWUI import init
from MWUI.models import Thesis, Attachment, User, Meeting
from MWUI.config import UPLOAD_ROOT
from pathlib import Path
from werkzeug.utils import secure_filename
import shutil

app = init()

m = Meeting[312]
path = Path('/tmp') / 'meeting_{0.id}'.format(m)
path.mkdir()

for t in Thesis.select(lambda x: x._parent == m).prefetch(Attachment, User):
    cat = path / t.type.fancy
    if not cat.exists():
        cat.mkdir()
    for a in t.attachments:
        in_file = UPLOAD_ROOT / a.file
        out_file = cat / '{}.{}_{}.{}'.format(secure_filename(t.author_name), t.id, a.id, a.file.split('.')[1])
        shutil.copy(str(in_file), str(out_file))
