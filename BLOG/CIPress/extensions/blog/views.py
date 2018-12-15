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
from flask import Blueprint, current_app, redirect, url_for, render_template
from math import ceil
from pony.orm import desc, db_session
from .database import Post


bp = Blueprint('blog', __name__, url_prefix='/news', template_folder='templates')


@bp.route('/list/', methods=('GET',), defaults={'page': 1})
@bp.route('/list/<int(min=1):page>', methods=('GET',))
@db_session
def blog(page):
    p = Post[current_app.config['schema']].select().order_by(lambda x: desc(x.date))
    page_size = current_app.config.get('blog_posts', 10)
    total = p.count()
    if 0 < total <= (page - 1) * page_size:
        return redirect(url_for('.blog'))
    return render_template('blog/list.html', title='News', subtitle='list',
                           posts=p.page(page, pagesize=page_size), paginator=Pagination(page, total, page_size))


@bp.route('/<int(min=1):_id>', methods=('GET',))
@db_session
def post(_id):
    p = Post[current_app.config['schema']].get(id=_id)
    if not p:
        return redirect(url_for('.blog'))

    return render_template('blog/post.html', title=p.title, post=p,
                           crumb={'url': url_for('.blog'), 'title': 'Post', 'parent': 'News'})


class Pagination:
    def __init__(self, page, total_count, pagesize):
        self.per_page = pagesize
        self.total_count = total_count or 1
        self.page = page

    @property
    def pages(self):
        return int(ceil(self.total_count / self.per_page))

    @property
    def has_prev(self):
        return self.page > 1

    @property
    def has_next(self):
        return self.page < self.pages

    @property
    def prev_num(self):
        return self.page - 1

    @property
    def next_num(self):
        return self.page + 1

    @property
    def offset(self):
        return (self.page - 1) * self.per_page

    def iter_pages(self):
        return range(1, self.pages + 1)
