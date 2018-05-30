# -*- coding: utf-8 -*-
#
#  Copyright 2016-2018 Ramil Nugmanov <stsouko@live.ru>
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
from flask import redirect, url_for, render_template, Blueprint, abort, make_response
from flask_login import login_required, current_user
from pony.orm import db_session, left_join
from ._forms import DeleteButtonForm
from .admin import PostEditView, AdminPostView, AdminUserView
from .auth import LoginView, LogoutView
from .blog import BlogView, AbstractsView, ThesesView, EventsView, ModelsView, DataView
from .post import PostView
from .profile import ProfileView
from .visitcard import IndexView, AboutView, StudentsView, LessonsView
from ..constants import UserRole, MeetingPostType
from ..models import User, Meeting, Post, Attachment, Subscription


table = namedtuple('Table', ('header', 'rows'))
row_admin = namedtuple('TableRow', ('number', 'participant', 'country', 'status', 'degree', 'presentation', 'town',
                                    'affiliation', 'email'))
row = namedtuple('TableRow', ('number', 'participant', 'country', 'status', 'degree', 'presentation'))
cell = namedtuple('TableCell', ('url', 'text'))


view_bp = Blueprint('view', __name__)

login_view = LoginView.as_view('login')
view_bp.add_url_rule('/login', view_func=login_view)
view_bp.add_url_rule('/login/<int:action>', view_func=login_view)

view_bp.add_url_rule('/logout', view_func=LogoutView.as_view('logout'))

profile_view = ProfileView.as_view('profile')
view_bp.add_url_rule('/profile', view_func=profile_view)
view_bp.add_url_rule('/profile/<int:action>', view_func=profile_view)

view_bp.add_url_rule('/page/<int:post>', view_func=PostView.as_view('blog_post'))

admin_post_view = AdminPostView.as_view('admin_post')
admin_user_view = AdminUserView.as_view('admin_user')
view_bp.add_url_rule('/admin/page/<int:post>', view_func=PostEditView.as_view('post_edit'))
view_bp.add_url_rule('/admin/posts', view_func=admin_post_view)
view_bp.add_url_rule('/admin/posts/<int:page>', view_func=admin_post_view)
view_bp.add_url_rule('/admin/users', view_func=admin_user_view)
view_bp.add_url_rule('/admin/users/<int:page>', view_func=admin_user_view)

index_view = IndexView.as_view('index')
view_bp.add_url_rule('/', view_func=index_view)
view_bp.add_url_rule('/index', view_func=index_view)

view_bp.add_url_rule('/about', view_func=AboutView.as_view('about'))
view_bp.add_url_rule('/students', view_func=StudentsView.as_view('students'))
view_bp.add_url_rule('/lessons', view_func=LessonsView.as_view('lessons'))

blog_view = BlogView.as_view('blog')
view_bp.add_url_rule('/news', view_func=blog_view)
view_bp.add_url_rule('/news/<int:page>', view_func=blog_view)

theses_view = ThesesView.as_view('theses')
view_bp.add_url_rule('/theses', view_func=theses_view)
view_bp.add_url_rule('/theses/<int:page>', view_func=theses_view)

events_view = EventsView.as_view('events')
view_bp.add_url_rule('/events', view_func=events_view)
view_bp.add_url_rule('/events/<int:page>', view_func=events_view)

abstracts_view = AbstractsView.as_view('abstracts')
view_bp.add_url_rule('/abstracts/<int:event>', view_func=abstracts_view)
view_bp.add_url_rule('/abstracts/<int:event>/<int:page>', view_func=abstracts_view)

models_view = ModelsView.as_view('models')
view_bp.add_url_rule('/models', view_func=models_view)
view_bp.add_url_rule('/models/<int:page>', view_func=models_view)

data_view = DataView.as_view('data')
view_bp.add_url_rule('/databases', view_func=data_view)
view_bp.add_url_rule('/databases/<int:page>', view_func=data_view)


@view_bp.errorhandler(404)
def page_not_found(*args, **kwargs):
    return render_template('layout.html', title='404', subtitle='Page not found'), 404


@view_bp.route('/search', methods=['GET'])
@login_required
def search():
    return render_template('react.html', title='Search', page='search')


@view_bp.route('/db_form', methods=['GET'])
@login_required
def db_form():
    return render_template('react.html', title='DB Form', page='dbform')


@view_bp.route('/predictor', methods=['GET'])
@login_required
def predictor():
    return render_template('react.html', title='Predictor', page='predictor')


@view_bp.route('/<string:_slug>/')
def slug(_slug):
    with db_session:
        p = Post.get(slug=_slug)
        if not p:
            abort(404)
        resp = make_response(redirect(url_for('.blog_post', post=p.id)))
        if p.classtype == 'Meeting' and p.type == MeetingPostType.MEETING:
            resp.set_cookie('meeting', str(p.id))
    return resp


@view_bp.route('/download/<file>/<name>', methods=['GET'])
@db_session
def download(file, name):
    a = Attachment.get(file=file)
    if a and a.post.classtype != 'Thesis' or current_user.is_authenticated and \
            (current_user.role_is(UserRole.ADMIN) or
             current_user.role_is(UserRole.SECRETARY) or
             a.post.author == current_user.get_user()):
        resp = make_response()
        resp.headers['X-Accel-Redirect'] = '/file/%s' % file
        resp.headers['Content-Description'] = 'File Transfer'
        resp.headers['Content-Transfer-Encoding'] = 'binary'
        resp.headers['Content-Disposition'] = 'attachment; filename=%s' % name
        resp.headers['Content-Type'] = 'application/octet-stream'
        return resp
    abort(404)


@view_bp.route('/remove/<file>/<name>', methods=['GET', 'POST'])
@db_session
@login_required
def remove(file, name):
    form = DeleteButtonForm()
    if form.validate_on_submit():
        a = Attachment.get(file=file)
        if a and (current_user.role_is(UserRole.ADMIN)
                  or a.post.classtype == 'Thesis' and a.post.author.id == current_user.id
                  and a.post.meeting.thesis_deadline > datetime.utcnow()):
            a.delete()
        return form.redirect()

    return render_template('button.html', form=form, title='Delete', subtitle=name)


@view_bp.route('/participants/<int:event>', methods=['GET'])
@db_session
def participants(event):
    m = Meeting.get(id=event, _type=MeetingPostType.MEETING.value)
    if not m:
        return redirect(url_for('.blog'))

    _admin = True if current_user.is_authenticated and (current_user.role_is(UserRole.ADMIN) or
                                                        current_user.role_is(UserRole.SECRETARY)) else False

    header = ('#', 'Participant', 'Country', 'Status', 'Degree', 'Presentation type', 'Town', 'Affiliation', 'Email') \
        if _admin else ('#', 'Participant', 'Country', 'Status', 'Degree', 'Presentation type')

    #  cache users entities
    list(left_join(x for x in User for s in x.subscriptions if s.meeting == m))
    subs = Subscription.select(lambda x: x.meeting == m).order_by(Subscription.id.desc())

    data = [row_admin(n, cell(url_for('.user', _user=x.user.id), x.user.full_name), x.user.country_name,
                      x.user.sci_status.fancy, x.user.sci_degree.fancy, x.type.fancy, x.user.town, x.user.affiliation,
                      x.user.email) if _admin else
            row(n, cell(url_for('.user', _user=x.user.id), x.user.full_name), x.user.country_name,
                x.user.sci_status.fancy, x.user.sci_degree.fancy, x.type.fancy)
            for n, x in enumerate(subs, start=1)]

    return render_template('table.html', table=table(header=header, rows=data), title=m.title, subtitle='Participants',
                           crumb=dict(url=url_for('.blog_post', post=event), title='Participants', parent='Event page'))


@view_bp.route('/user/<int:_user>', methods=['GET'])
@db_session
def user(_user):
    u = User.get(id=_user)
    if not u:
        return redirect(url_for('.index'))
    return render_template('user.html', data=u, title=u.full_name, subtitle='Profile')
