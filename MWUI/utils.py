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


def jsonify_structures(structures):
    out = []
    for s in structures:
        out.append(dict(status=s['status'].value, type=s['type'].value, structure=s['structure'],
                        data=s['data'], pressure=s['pressure'], temperature=s['temperature'],
                        additives=[dict(additive=a['additive'], name=a['name'], structure=a['structure'],
                                        type=a['type'].value, amount=a['amount'])
                                   for a in s['additives']],
                        models=[dict(type=m['type'].value, model=m['model'], name=m['name'],
                                     results=[dict(type=r['type'].value, key=r['key'], value=r['value'])
                                              for r in m.get('results', [])]) for m in s['models']]))
    return out


def filter_kwargs(kwargs):
    return {x: y for x, y in kwargs.items() if y}
