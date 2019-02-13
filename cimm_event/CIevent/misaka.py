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
from misaka import HtmlRenderer, escape_html


class MisakaRenderer(HtmlRenderer):
    def table(self, content):
        return f'<table class="table">{content}</table>'

    def image(self, raw_url, title='', alt=''):
        """
        Filters the ``src`` attribute of an image.

        Note that filtering the source URL of an ``<img>`` tag is only a very
        basic protection, and it's mostly useless in modern browsers (they block
        JavaScript in there by default). An example of attack that filtering
        does not thwart is phishing based on HTTP Auth, see `this issue
        <https://github.com/liberapay/liberapay.com/issues/504>`_ for details.

        To mitigate this issue you should only allow images from trusted services,
        for example your own image store, or a proxy (see :meth:`rewrite_url`).
        """

        maybe_alt = ' alt="%s"' % escape_html(alt) if alt else ''
        maybe_title = ' title="%s"' % escape_html(title) if title else ''
        url = escape_html(raw_url)
        return f'<img class="img-fluid" src="{url}"{maybe_alt}{maybe_title}/>'


__all__ = ['MisakaRenderer']
