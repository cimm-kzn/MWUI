# -*- coding: utf-8 -*-
#
#  Copyright 2017 Ramil Nugmanov <stsouko@live.ru>
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
from collections import namedtuple
from flask import render_template, url_for
from flask.views import View
from pony.orm import db_session, select
from ..config import BLOG_POSTS_PER_PAGE, LAB_NAME
from ..constants import BlogPostType, MeetingPostType, TeamPostType
from ..models import BlogPost, Post, TeamPost


grid = namedtuple('Grid', ('rows', 'width'))
row = namedtuple('Row', ('title', 'banner', 'url', 'text', 'more'))


class IndexView(View):
    methods = ['GET']
    decorators = [db_session]

    def dispatch_request(self):
        c = select(x for x in BlogPost if x._type == BlogPostType.CAROUSEL.value
                   and x.banner is not None).order_by(BlogPost.id.desc()).limit(BLOG_POSTS_PER_PAGE)
        ip = select(x for x in Post if x._type in (BlogPostType.IMPORTANT.value,
                                                   MeetingPostType.MEETING.value)).order_by(Post.id.desc()).limit(3)

        return render_template("home.html", carousel=c, info=ip, title='Welcome to', subtitle=LAB_NAME)


class AboutView(View):
    methods = ['GET']
    decorators = [db_session]

    def dispatch_request(self):
        about_us = select(x for x in BlogPost if x._type == BlogPostType.ABOUT.value).first()
        chief = select(x for x in TeamPost if x._type == TeamPostType.CHIEF.value).order_by(lambda x:
                                                                                            x.special['order'])
        team = select(x for x in TeamPost if x._type == TeamPostType.TEAM.value).order_by(TeamPost.id.desc())
        return render_template("grid.html", title='About', subtitle='Laboratory',
                               about=row(about_us.title, about_us.banner, url_for('.blog_post', post=about_us.id),
                                         about_us.body[:997] + '...' if len(about_us.body) > 1000 else about_us.body,
                                         None) if about_us else None,
                               grid_big=grid(rows=((row(y.title, y.banner, url_for('.blog_post', post=y.id),
                                                        y.role,
                                                        y.body[:197] + '...' if len(y.body) > 200 else y.body)
                                                    for y in chief[x: x + 3])
                                                   for x in range(0, len(chief), 3)), width=4),
                               grid_small=grid(rows=((row(y.title, y.banner, url_for('.blog_post', post=y.id),
                                                          y.role, None) for y in team[x: x + 3])
                                                     for x in range(0, len(team), 3)), width=4))


class StudentsView(View):
    methods = ['GET']
    decorators = [db_session]

    def dispatch_request(self):
        studs = select(x for x in TeamPost if x._type == TeamPostType.STUDENT.value).order_by(TeamPost.id.desc())
        return render_template("grid.html", title='Laboratory', subtitle='students',
                               grid_small=grid(rows=((row(y.title, y.banner, url_for('.blog_post', post=y.id),
                                                          y.role, None) for y in studs[x: x + 4])
                                                     for x in range(0, len(studs), 4)), width=3))


class LessonsView(View):
    methods = ['GET']
    decorators = [db_session]

    def dispatch_request(self):
        less = select(x for x in BlogPost if x._type == BlogPostType.LESSON.value).order_by(BlogPost.id.desc())
        return render_template("grid.html", title='Master', subtitle='courses',
                               grid_small=grid(rows=((row(y.title, y.banner, url_for('.blog_post', post=y.id),
                                                          None, None) for y in less[x: x + 3])
                                                     for x in range(0, len(less), 3)), width=4))
