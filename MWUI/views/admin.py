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
from collections import namedtuple
from datetime import datetime
from flask import redirect, url_for, render_template
from flask.views import View
from flask_login import current_user, login_required
from pony.orm import db_session
from ..bootstrap import Pagination
from ..config import BLOG_POSTS_PER_PAGE
from ..constants import UserRole
from ..forms import PostForm, MeetingForm, EmailForm, ThesisForm, TeamForm
from ..models import Post, Subscription, User
from ..upload import save_upload


table = namedtuple('Table', ('header', 'rows'))
row_post = namedtuple('TableRow', ('number', 'author', 'time', 'title'))
row_user = namedtuple('TableRow', ('number', 'name', 'email', 'status', 'role'))
cell = namedtuple('TableCell', ('url', 'text'))


class PostEditView(View):
    methods = ['GET', 'POST']
    decorators = [login_required, db_session]

    def dispatch_request(self, post):
        if not current_user.role_is(UserRole.ADMIN):
            return redirect(url_for('.blog_post', post=post))

        p = Post.get(id=post)
        if not p:
            return redirect(url_for('.admin_post'))

        if p.classtype == 'BlogPost':
            special_form = PostForm(obj=p, admin=True)
        elif p.classtype == 'Meeting':
            special_form = MeetingForm(obj=p, admin=True)
        elif p.classtype == 'Thesis':
            special_form = ThesisForm(obj=p, admin=True)
        elif p.classtype == 'Email':
            special_form = EmailForm(obj=p, admin=True)
        elif p.classtype == 'TeamPost':
            special_form = TeamForm(obj=p, admin=True)
        else:  # BAD POST
            return redirect(url_for('.admin_post'))

        if special_form.validate_on_submit():
            if special_form.to_delete.data:
                p.delete()
                return redirect(url_for('.admin_post'))

            p.body = special_form.body.data
            p.title = special_form.title.data
            p.date = datetime.utcnow()

            if hasattr(special_form, 'slug') and special_form.slug.data:
                p.slug = special_form.slug.data

            if special_form.banner_field.data:
                p.banner = save_upload(special_form.banner_field.data, images=True)

            if special_form.attachment.data:
                p.add_attachment(*save_upload(special_form.attachment.data))

            if hasattr(p, 'update_type'):
                try:
                    p.update_type(special_form.type)
                    if p.classtype == 'Thesis':
                        sub = Subscription.get(user=p.author, meeting=p.meeting)
                        sub.update_type(special_form.type.participation_type)
                except Exception as e:
                    special_form.post_type.errors = [str(e)]

            if hasattr(p, 'update_meeting') and p.can_update_meeting() and special_form.meeting_id.data:
                p.update_meeting(special_form.meeting_id.data)

            if hasattr(p, 'update_order') and special_form.order.data:
                p.update_order(special_form.order.data)

            if hasattr(p, 'update_role'):
                p.update_role(special_form.role.data)

            if hasattr(p, 'update_scopus'):
                p.update_scopus(special_form.scopus.data)

            if hasattr(p, 'update_from_name'):
                p.update_from_name(special_form.from_name.data)

            if hasattr(p, 'update_reply_name'):
                p.update_reply_name(special_form.reply_name.data)

            if hasattr(p, 'update_reply_mail'):
                p.update_reply_mail(special_form.reply_mail.data)

            if hasattr(p, 'update_body_name'):
                p.update_body_name(special_form.body_name.data)

            if hasattr(p, 'update_deadline') and special_form.deadline.data:
                p.update_deadline(special_form.deadline.data)

            if hasattr(p, 'update_thesis_deadline') and special_form.thesis_deadline.data:
                p.update_thesis_deadline(special_form.thesis_deadline.data)

            if hasattr(p, 'update_thesis_count') and special_form.thesis_count.data:
                p.update_thesis_count(special_form.thesis_count.data)

            if hasattr(p, 'update_participation_types') and special_form.participation_types:
                p.update_participation_types(special_form.participation_types)

            if hasattr(p, 'update_thesis_types') and special_form.thesis_types:
                p.update_thesis_types(special_form.thesis_types)

            if hasattr(p, 'update_authors') and special_form.authors.data:
                p.update_authors(special_form.authors.data)

            if hasattr(p, 'update_affiliations') and special_form.affiliations.data:
                p.update_affiliations(special_form.affiliations.data)

        crumb = dict(url=url_for('.admin_post'), title='Edit', parent='Admin')
        attachments = list(p.attachments)

        return render_template("post.html", title=p.title, post=p, crumb=crumb, deletable=True,
                               special_form=special_form, special_field=None, attachments=attachments)


class AdminPostView(View):
    methods = ['GET']
    decorators = [login_required, db_session]

    def dispatch_request(self, page=1):
        if not current_user.role_is(UserRole.ADMIN):
            return redirect(url_for('.index'))

        q = Post.select().order_by(Post.id.desc())
        if page < 1:
            return redirect(url_for('.admin_post'))

        pag = Pagination(page, q.count(), pagesize=BLOG_POSTS_PER_PAGE * 5)
        if page != pag.page:
            return redirect(url_for('.admin_post'))

        posts = [row_post(cell(url_for('.post_edit', post=x.id), x.id),
                          x.author_name, x.date.strftime('%d/%m/%Y %H:%M'), x.title)
                 for x in q.page(page, pagesize=BLOG_POSTS_PER_PAGE * 5)]
        return render_template("table.html", paginator=pag, title='Posts', subtitle='List',
                               table=table(header=('#', 'Author', 'Time', 'Title'), rows=posts))


class AdminUserView(View):
    methods = ['GET']
    decorators = [login_required, db_session]

    def dispatch_request(self, page=1):
        if not current_user.role_is(UserRole.ADMIN):
            return redirect(url_for('.index'))

        q = User.select().order_by(User.id.desc())
        if page < 1:
            return redirect(url_for('.admin_user'))

        pag = Pagination(page, q.count(), pagesize=BLOG_POSTS_PER_PAGE * 5)
        if page != pag.page:
            return redirect(url_for('.admin_user'))

        users = [row_user(cell(url_for('.user', _user=x.id), x.id), x.full_name, x.email,
                          x.active and 'ok' or 'banned', x.role.name)
                 for x in q.page(page, pagesize=BLOG_POSTS_PER_PAGE * 5)]
        return render_template("table.html", paginator=pag, title='Users', subtitle='Registered',
                               table=table(header=('#', 'Name', 'Email', 'Status', 'Role'), rows=users))
