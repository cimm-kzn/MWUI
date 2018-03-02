#!/usr/bin/env python3
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
from MWUI.version import version
from pathlib import Path
from setuptools import setup, find_packages

setup(
    name='MWUI',
    version=version(),
    packages=find_packages(),
    url='https://github.com/stsouko/MWUI',
    license='AGPLv3',
    author='Dr. Ramil Nugmanov',
    author_email='stsouko@live.ru',
    description='MWUI',
    package_data={'MWUI': ['templates/*.html', 'static/css/*.css', 'static/js/*.js',
                           'static/marvinjs/js/webservices.js', 'static/favicon.ico', 'static/logo.png']},
    scripts=['mwui.py', 'redis_mail.py', 'redis_scopus.py'],
    install_requires=['redis', 'rq', 'bcrypt', 'pony', 'pycountry', 'werkzeug', 'flask', 'flask-login'],
    extras_require={'postgres_cffi':  ['cffi', 'psycopg2cffi'],
                    'postgres':  ['psycopg2'],
                    'swagger': ['flask-restful-swagger'],
                    'views': ['jinja2', 'wtforms', 'dominate', 'misaka', 'flask-misaka', 'flask-nav', 'flask-resize',
                              'flask-wtf', 'flask-bootstrap'],
                    'scopus': ['requests'],
                    'vk': ['requests'],
                    'jobs': ['flask_restful'],
                    'cgrdb': ['six', 'flask_restful', 'CGRtools>=2.8,<2.9', 'CGRdb>=1.2,<1.3']},
    long_description=(Path(__file__).parent / 'README.md').open().read(),
    keywords="MWUI database QSPR predictions interface WEB",
    classifiers=['Environment :: Web Environment',
                 'Intended Audience :: Science/Research',
                 'Intended Audience :: Developers',
                 'Topic :: Scientific/Engineering :: Chemistry',
                 'Topic :: Software Development :: Libraries :: Python Modules',
                 'License :: OSI Approved :: GNU Affero General Public License v3 or later (AGPLv3+)',
                 'Operating System :: OS Independent',
                 'Programming Language :: Python',
                 'Programming Language :: Python :: 3',
                 'Programming Language :: Python :: 3.5',
                 ],
    command_options={'build_sphinx': {'project': ('setup.py', 'MWUI'),
                                      'version': ('setup.py', version()), 'source_dir': ('setup.py', 'doc'),
                                      'build_dir':  ('setup.py', 'build/doc'),
                                      'all_files': ('setup.py', True),
                                      'copyright': ('setup.py', 'Dr. Ramil Nugmanov <stsouko@live.ru>')},
                     'easy_install': {'allow_hosts': ('setup.py', 'github.com, pypi.python.org')}}
)
