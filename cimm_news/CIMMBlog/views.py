# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of CIMMBlog.
#
#  CIMMBlog is free software; you can redistribute it and/or modify
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
from flask import Blueprint, render_template, current_app, abort, url_for, redirect, request, Response
from functools import wraps
from pony.orm import desc, ObjectNotFound
from .database import Post, Category, Tag
from .forms import EditPost


def authenticate(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.authorization
        if auth and (auth.username, auth.password) == (current_app.config.admin_login, current_app.config.admin_pass):
            return f(*args, **kwargs)
        return Response('access deny', 401, {'WWW-Authenticate': 'Basic realm="Login Required"'})
    return wrapper


views = Blueprint('views', __name__)


@views.route('/')
@views.route('/page/<int(min=1):page>')
@views.route('/category/<int(min=1):category>')
@views.route('/category/<int(min=1):category>/page/<int(min=1):page>')
def index(category=None, page=1, order_by_views=False):
    posts = Post.select()
    if category:
        if not Category.exists(id=category):
            abort(404)
        posts = posts.filter(lambda x: x.category.id == category)

    total = posts.count()
    if total == 0:
        posts = []
        next_page = None
        banner = None
    elif total <= (page - 1) * current_app.config.posts_per_page:
        abort(404)
    else:
        banner = posts.random(1)[0].banner
        if order_by_views:
            posts = posts.order_by(lambda x: desc(x.views))
            next_page = None
        else:
            posts = posts.order_by(lambda x: desc(x.id))
            if total > page * current_app.config.posts_per_page:
                next_page = page + 1

        posts = posts.page(page, current_app.config.posts_per_page)

    categories = Category.select().order_by(lambda x: x.id)[:]
    return render_template('index.html', posts=posts, next_page=next_page, category=category, banner=banner,
                           categories=categories)


@views.route('/post/<int(min=1):post>')
def post_page(post):
    try:
        post = Post[post]
    except ObjectNotFound:
        abort(404)
    post.views += 1
    categories = Category.select().order_by(lambda x: x.id)[:]
    return render_template('post.html', post=post, categories=categories)


@views.route('/popular/')
@views.route('/popular/category/<int(min=1):category>')
def popular(category=None):
    return index(category, order_by_views=True)


@views.route('/edit/<int(min=1):post>')
@authenticate
def edit(post):
    try:
        p = Post[post]
    except ObjectNotFound:
        abort(404)
    categories = Category.select().order_by(lambda x: x.id)[:]
    form = EditPost(obj=p, categories=categories)
    if form.validate_on_submit():
        if form.to_delete.data:
            p.delete()
            return redirect(url_for('.index'))

        p.title = form.title.data
        p.body = form.body.data
        p.category = Category[form.category.data]
        p.tags.clear()
        for t in form.tags:
            t = Tag.get(name=t) or Tag(name=t)
            p.tags.add(t)
        return redirect(url_for('.post_page', post=post))
    return render_template('edit.html', post=p, form=form)


__all__ = ['views']
