# -*- coding: utf-8 -*-
#
#  Copyright 2019 Ramil Nugmanov <stsouko@live.ru>
#  This file is part of cimm_blog.
#
#  cimm_blog is free software; you can redistribute it and/or modify
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
from pony.orm import db_session
from re import findall, sub
from requests import get
from shutil import copyfileobj
from uuid import uuid4
from .models import User, BlogPost


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
            try:
                res = self.__prepare_post(data['object'])
            except:
                print('parsing error', data)
                return 'ok'

            if res['banner']:
                try:
                    r = get(res['banner'], stream=True)
                    if r.status_code == 200:
                        banner = '%s.jpg' % uuid4()
                        with (IMAGES_ROOT / banner).open('wb') as f:
                            r.raw.decode_content = True
                            copyfileobj(r.raw, f)
                    else:
                        print('banner not found')
                        banner = None
                except:
                    print('banner load error')
                    banner = None
            else:
                banner = None

            self.__add_post(res['title'], res['body'], banner)

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

        attachments = data.get('attachments', [])
        banner = cls.__get_banner_url(attachments)
        links = cls.__get_links(attachments)
        links = '\n\n####Links:\n* %s' % '\n* '.join(links) if links else ''
        return {'title': title, 'body': text + links, 'banner': banner}

    @staticmethod
    def __get_banner_url(attachments):
        for x in attachments:
            _type = x['type']
            if _type == 'photo':
                for k in ('photo_2560', 'photo_1280', 'photo_807', 'photo_604', 'photo_320', 'photo_130'):
                    if k in x[_type]:
                        return x[_type][k]
        for x in attachments:
            _type = x['type']
            if _type == 'video':
                for k in ('photo_800', 'photo_640', 'photo_320', 'photo_130'):
                    if k in x[_type]:
                        return x[_type][k]
        for x in attachments:
            _type = x['type']
            if _type == 'link':
                if 'photo' in x[_type]:
                    for k in ('photo_2560', 'photo_1280', 'photo_807', 'photo_604', 'photo_320', 'photo_130'):
                        if k in x[_type]['photo']:
                            return x[_type]['photo'][k]

    @staticmethod
    def __get_links(attachments):
        urls = []
        for x in attachments:
            _type = x['type']
            if _type in ('video', 'photo', 'doc'):
                urls.append('https://vk.com/%s%s_%s' % (_type, x[_type]['owner_id'], x[_type]['id']))
            elif _type == 'link':
                urls.append(x[_type]['url'])
        return urls

    @db_session
    def __add_post(self, title, body, banner):
        BlogPost(type=BlogPostType.COMMON, author=User[VK_AUTHOR], title=title, body=body, banner=banner)


vk_api = Blueprint('vk_api', __name__)
vk_api.add_url_rule('/callback', view_func=VKView.as_view('callback'))


__all__ = ['vk_api']
