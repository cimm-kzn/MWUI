# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of CIevent.
#
#  CIevent is free software; you can redistribute it and/or modify
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
from flask import Blueprint, render_template, current_app, abort
from .database import *


views = Blueprint('views', __name__)


@views.route('/<event>/')
@views.route('/<event>/<int(min=1):page>')
def page_view(event, page=None):
    event = Event[current_app.config.db_schema].get(abbr=event.lower())
    if not event:
        abort(404)

    page_ent = Page[current_app.config.db_schema]
    if page:
        page = page_ent.get(event=event, id=page)
        if not page:
            abort(404)
    else:
        page = page_ent.select(lambda x: x.event == event).order_by(lambda x: x.order).prefetch(page_ent.body).first()

    return render_template('page.html', page=page, event=event)


__all__ = ['views']
