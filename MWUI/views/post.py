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
from datetime import datetime
from flask import redirect, url_for, render_template, flash
from flask.views import View
from flask_login import current_user
from pony.orm import db_session, select, commit
from ..constants import (UserRole, BlogPostType, MeetingPostType, EmailPostType, TeamPostType, MeetingPartType,
                         ThesisPostType)
from ..forms import PostForm, DeleteButtonForm, MeetingForm, EmailForm, ThesisForm, TeamForm, MeetForm
from ..models import Email, Post, Thesis, Subscription
from ..scopus import get_articles
from ..sendmail import send_mail, attach_mixin
from ..upload import save_upload, combo_save


class PostView(View):
    methods = ['GET', 'POST']
    decorators = [db_session]

    def dispatch_request(self, post):
        admin = current_user.is_authenticated and current_user.role_is(UserRole.ADMIN)
        secretary = current_user.is_authenticated and current_user.role_is(UserRole.SECRETARY)
        special_form = special_field = children = title = info = None

        p = Post.get(id=post)
        if not p:
            return redirect(url_for('.blog'))

        opened_by_author = current_user.is_authenticated and p.author.id == current_user.id
        downloadable = admin or secretary or p.classtype != 'Thesis' or opened_by_author
        deletable = admin or p.classtype == 'Thesis' and opened_by_author and p.meeting.deadline > datetime.utcnow()
        """ admin page
        """
        if admin:
            x = self.admin(p)
            if not isinstance(x, tuple):
                return x
            edit_post, remove_post_form = x
        else:
            edit_post = remove_post_form = None

        """ Meetings sidebar and title
        """
        if p.classtype == 'Meeting':
            x = self.meeting_page(p)
            if not isinstance(x, tuple):
                return x

            crumb, title, children, special_form = x
        elif p.classtype == 'Thesis':
            crumb, special_field = self.thesis_page(p, opened_by_author)
        elif p.classtype == 'TeamPost':
            crumb, special_field = self.team_page(p)
        elif p.type == BlogPostType.ABOUT:
            crumb = dict(url=url_for('.about'), title='Description', parent='Laboratory')
        else:
            crumb, info = self.common_page(p)

        return render_template("post.html", title=title or p.title, post=p, info=info, downloadable=downloadable,
                               children=children, deletable=deletable,
                               edit_form=edit_post, remove_form=remove_post_form, crumb=crumb,
                               special_form=special_form, special_field=special_field)

    @staticmethod
    def common_page(post):
        """ collect sidebar news
        """
        info = select(x for x in Post if x.id != post.id and x.post_type in
                      (BlogPostType.IMPORTANT.value, MeetingPostType.MEETING.value)).order_by(Post.date.desc()).limit(3)
        return dict(url=url_for('.blog'), title='Post', parent='News'), info

    @staticmethod
    def team_page(post):
        crumb = dict(url=url_for('.students'), title='Student', parent='Laboratory') \
                if post.type == TeamPostType.STUDENT else \
                dict(url=url_for('.about'), title='Member', parent='Laboratory')
        scopus = get_articles(post.scopus) if post.scopus else None

        return crumb, scopus

    @staticmethod
    def thesis_page(post, opened_by_author):
        if opened_by_author and post.meeting.thesis_deadline > datetime.utcnow():
            sub = Subscription.get(user=post.author, meeting=post.meeting)
            thesis_types = post.meeting.thesis_types
            thesis_count = Thesis.select(lambda x: x.post_parent == post.meeting and x.author == post.author).count()
            special_form = ThesisForm(prefix='special', obj=post, body_name=post.body_name,
                                      types=[x for x in ThesisPostType.thesis_types(sub.type, dante=thesis_count > 1)
                                             if x in thesis_types])
            if special_form.validate_on_submit():
                post.title = special_form.title.data
                post.body = special_form.body.data
                post.update_type(special_form.type)

                if special_form.banner_field.data:
                    post.banner = save_upload(special_form.banner_field.data, images=True)
                if special_form.attachment.data:
                    post.add_attachment(*save_upload(special_form.attachment.data))

        crumb = dict(url=url_for('.abstracts', event=post.meeting_id), title='Abstract', parent='Event abstracts')
        meta = '**Presentation Type**: *%s*' % post.type.fancy

        return crumb, meta

    @staticmethod
    def meeting_page(post):
        special_form = None
        if post.type != MeetingPostType.MEETING:
            if current_user.is_authenticated and post.type == MeetingPostType.REGISTRATION \
                    and post.deadline > datetime.utcnow():

                sub = Subscription.get(user=current_user.get_user(), meeting=post.meeting)
                special_form = MeetForm(prefix='special', obj=sub, types=post.meeting.participation_types)

                if special_form.validate_on_submit():
                    theses = list(Thesis.select(lambda x: x.post_parent == post.meeting and
                                                x.author == current_user.get_user()))
                    if sub:
                        if special_form.type == MeetingPartType.LISTENER and theses:
                            special_form.part_type.errors = ['Listener participation type unavailable. '
                                                             'You sent thesis earlier.']
                            flash('Participation type change error', 'error')
                        else:
                            sub.update_type(special_form.type)
                            thesis_types = post.meeting.thesis_types
                            thesis_type = next(x for x in ThesisPostType.thesis_types(sub.type)[::-1]
                                               if x in thesis_types)
                            for thesis in theses:
                                if thesis.type != thesis_type:
                                    thesis.update_type(thesis_type)
                                    flash('Thesis type changed! Check it.')
                            flash('Participation type changed!')
                    else:
                        Subscription(current_user.get_user(), post.meeting, special_form.type)
                        flash('Welcome to meeting!')

                        m = Email.get(post_parent=post.meeting, post_type=EmailPostType.MEETING_THESIS.value)
                        attach_files, attach_names = attach_mixin(m)
                        send_mail((m and m.body or '%s\n\nYou registered to meeting') % current_user.full_name,
                                  current_user.email, to_name=current_user.full_name, title=m and m.title,
                                  subject=m and m.title or 'Welcome to meeting', banner=m and m.banner,
                                  from_name=m and m.from_name, reply_mail=m and m.reply_mail,
                                  reply_name=m and m.reply_name,
                                  attach_files=attach_files, attach_names=attach_names)

                        rid = select(x.id for x in Post if x.post_parent == post.meeting and
                                     x.post_type == MeetingPostType.SUBMISSION.value).first()
                        return redirect(url_for('.blog_post', post=rid))

            elif current_user.is_authenticated and post.type == MeetingPostType.SUBMISSION \
                    and post.thesis_deadline > datetime.utcnow():

                sub = Subscription.get(user=current_user.get_user(), meeting=post.meeting)
                if sub and sub.type != MeetingPartType.LISTENER:
                    thesis_count = Thesis.select(lambda x: x.post_parent == post.meeting and
                                                 x.author == current_user.get_user()).count()
                    if thesis_count < post.meeting.thesis_count:
                        thesis_types = post.meeting.thesis_types
                        special_form = ThesisForm(prefix='special', body_name=post.body_name,
                                                  types=[x for x in
                                                         ThesisPostType.thesis_types(sub.type, dante=thesis_count > 0)
                                                         if x in thesis_types])
                        if special_form.validate_on_submit():
                            banner_name, file_name = combo_save(special_form.banner_field, special_form.attachment)
                            t = Thesis(post.meeting_id, type=special_form.type,
                                       title=special_form.title.data, body=special_form.body.data,
                                       banner=banner_name, attachments=file_name, author=current_user.get_user())
                            commit()
                            return redirect(url_for('.blog_post', post=t.id))

            crumb = dict(url=url_for('.blog_post', post=post.meeting_id), title=post.title, parent='Event main page')
        else:
            crumb = dict(url=url_for('.blog'), title='Post', parent='News')

        children = [dict(title='Event main page', url=url_for('.blog_post', post=post.meeting_id))]
        children.extend(dict(title=x.title, url=url_for('.blog_post', post=x.id)) for x in post.meeting.children.
                        filter(lambda x: x.classtype == 'Meeting').order_by(lambda x: x.special['order']))
        children.append(dict(title='Participants', url=url_for('.participants', event=post.meeting_id)))
        children.append(dict(title='Abstracts', url=url_for('.abstracts', event=post.meeting_id)))

        return crumb, post.meeting.title, children, special_form

    @staticmethod
    def admin(post):
        remove_post_form = DeleteButtonForm(prefix='delete')
        if post.classtype == 'BlogPost':
            edit_post = PostForm(obj=post)
        elif post.classtype == 'Meeting':
            edit_post = MeetingForm(obj=post)
        elif post.classtype == 'Thesis':
            edit_post = ThesisForm(obj=post)
        elif post.classtype == 'Email':
            edit_post = EmailForm(obj=post)
        elif post.classtype == 'TeamPost':
            edit_post = TeamForm(obj=post)
        else:  # BAD POST
            return

        if remove_post_form.validate_on_submit():
            post.delete()
            return remove_post_form.redirect('.blog')
        elif edit_post.validate_on_submit():
            post.body = edit_post.body.data
            post.title = edit_post.title.data
            post.date = datetime.utcnow()

            if hasattr(edit_post, 'slug') and edit_post.slug.data:
                post.slug = edit_post.slug.data

            if edit_post.banner_field.data:
                post.banner = save_upload(edit_post.banner_field.data, images=True)

            if edit_post.attachment.data:
                post.add_attachment(*save_upload(edit_post.attachment.data))

            if hasattr(post, 'update_type'):
                try:
                    post.update_type(edit_post.type)
                    if post.classtype == 'Thesis':
                        sub = Subscription.get(user=post.author, meeting=post.meeting)
                        sub.update_type(edit_post.type.participation_type)
                except Exception as e:
                    edit_post.post_type.errors = [str(e)]

            if hasattr(post, 'update_meeting') and post.can_update_meeting() and edit_post.meeting_id.data:
                post.update_meeting(edit_post.meeting_id.data)

            if hasattr(post, 'update_order') and edit_post.order.data:
                post.update_order(edit_post.order.data)

            if hasattr(post, 'update_role'):
                post.update_role(edit_post.role.data)

            if hasattr(post, 'update_scopus'):
                post.update_scopus(edit_post.scopus.data)

            if hasattr(post, 'update_from_name'):
                post.update_from_name(edit_post.from_name.data)

            if hasattr(post, 'update_reply_name'):
                post.update_reply_name(edit_post.reply_name.data)

            if hasattr(post, 'update_reply_mail'):
                post.update_reply_mail(edit_post.reply_mail.data)

            if hasattr(post, 'update_body_name'):
                post.update_body_name(edit_post.body_name.data)

            if hasattr(post, 'update_deadline') and edit_post.deadline.data:
                post.update_deadline(edit_post.deadline.data)

            if hasattr(post, 'update_thesis_deadline') and edit_post.thesis_deadline.data:
                post.update_thesis_deadline(edit_post.thesis_deadline.data)

            if hasattr(post, 'update_thesis_count') and edit_post.thesis_count.data:
                post.update_thesis_count(edit_post.thesis_count.data)

            if hasattr(post, 'update_participation_types') and edit_post.participation_types:
                post.update_participation_types(edit_post.participation_types)

            if hasattr(post, 'update_thesis_types') and edit_post.thesis_types:
                post.update_thesis_types(edit_post.thesis_types)

        return edit_post, remove_post_form
