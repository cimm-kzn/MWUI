# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of CIpress.
#
#  CIpress is free software; you can redistribute it and/or modify
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
from flask import Blueprint, request, current_app
from flask.views import View
from re import findall, sub
from requests import get
from shutil import copyfileobj
from uuid import uuid4
from .database import *


class VKView(View):
    methods = ['POST']

    def dispatch_request(self):
        data = request.get_json(force=True)

        if not isinstance(data, dict) or 'type' not in data and 'secret' not in data:  # simple check
            return 'not vk'
        elif data['secret'] != current_app.config.vk_secret:
            return 'invalid request'

        _type = data['type']
        if _type == 'confirmation':
            return current_app.config.vk_token
        elif _type in ('wall_post_new', 'wall_repost'):
            res = self.__prepare_post(data['object'])
            self.__add_post(res)

        return 'ok'

    @classmethod
    def __prepare_post(cls, data):
        if 'copy_history' in data:  # for reposts
            data = data['copy_history'][-1]

        text = data['text'].replace('<br>', '\n').strip()
        text = sub(r'#(\w+)', r'\#\1', text)
        tags = [x[1:] for x in findall(r'#\w+', text)]
        title, *body = text.split('\n', 1)
        if len(title) > 200:
            body = text
            title = title[: 200].rsplit(' ', 1)[0] + '...'
        elif not body:
            body = text
        else:
            body = body[0]

        post = {'title': title, 'tags': tags}
        if 'attachments' in data:
            banner = cls.__get_banner_url(data['attachments'])
            if banner:
                banner = cls.__get_banner(banner)
                if banner:
                    post['banner'] = banner
            links = cls.__get_links(data['attachments'])
            if links:
                post['body'] = body + '\n\n####Links:\n* %s' % '\n* '.join(links)
            else:
                post['body'] = body
        else:
            post['body'] = body
        return post

    @staticmethod
    def __get_banner_url(attachments):
        for x in attachments:
            _type = x['type']
            if _type == 'photo':
                photo = x[_type]
                for k in ('photo_2560', 'photo_1280', 'photo_807', 'photo_604', 'photo_320', 'photo_130'):
                    if k in photo:
                        return photo[k]
        for x in attachments:
            _type = x['type']
            if _type == 'video':
                video = x[_type]
                for k in ('photo_800', 'photo_640', 'photo_320', 'photo_130'):
                    if k in video:
                        return video[k]
        for x in attachments:
            _type = x['type']
            if _type == 'link':
                if 'photo' in x[_type]:
                    photo = x[_type]['photo']
                    for k in ('photo_2560', 'photo_1280', 'photo_807', 'photo_604', 'photo_320', 'photo_130'):
                        if k in photo:
                            return photo[k]

    @staticmethod
    def __get_links(attachments):
        urls = []
        for x in attachments:
            _type = x['type']
            data = x[_type]
            if _type in ('video', 'photo', 'doc'):
                urls.append(f'https://vk.com/{_type}{data["owner_id"]}_{data["id"]}')
            elif _type == 'link':
                urls.append(data['url'])
        return urls

    @staticmethod
    def __get_banner(banner):
        r = get(banner, stream=True)
        if r.status_code == 200:
            banner = f'{uuid4()}.jpg'
            with open(f'{current_app.static_folder}/images/{banner}', 'wb') as f:
                r.raw.decode_content = True
                copyfileobj(r.raw, f)
            return banner

    @staticmethod
    def __add_post(post):
        tags = post.pop('tags')
        a = Author[current_app.config.db_schema][current_app.config.vk_author]
        c = Category[current_app.config.db_schema][current_app.config.vk_category]
        p = Post[current_app.config.db_schema](**post, author=a, category=c)
        t = Tag[current_app.config.db_schema]
        for tag in tags:
            te = t.get(name=tag)
            if not te:
                te = t(name=tag)
            p.tags.add(te)
        return p


vk_api = Blueprint('vk_api', __name__)
vk_api.add_url_rule('/callback', view_func=VKView.as_view('callback'))


__all__ = ['vk_api']
