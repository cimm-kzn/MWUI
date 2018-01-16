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
from collections import namedtuple, defaultdict, OrderedDict
from datetime import datetime, timedelta
from pony.orm import PrimaryKey, Required, Optional, Set, left_join, select, flush, desc
from requests import get
from .utils import OrderedSet
from ..config import DEBUG, SCOPUS_API_KEY, SCOPUS_TTL, SCOPUS_SUBJECT

metric = namedtuple('Metrics', ['h_index', 'citations'])
article = namedtuple('Article', ['authors', 'title', 'journal', 'volume', 'issue', 'pages', 'date', 'doi', 'cited',
                                 'issn', 'scopus_id'])
year_score = namedtuple('YearScore', ['year', 'score'])
year_rank = namedtuple('YearRank', ['year', 'percentile', 'subject_code'])
author = namedtuple('Author', ['surname', 'initials', 'scopus_id'])


def load_tables(db, schema):
    class Journal(db.Entity):
        _table_ = '%s_journal' % schema if DEBUG else (schema, 'journal')
        id = PrimaryKey(int, auto=True)
        title = Required(str, unique=True)
        issn = Optional('JournalISSN')
        articles = Set('Article')

        @property
        def is_fresh(self):
            if not self.issn:
                return True

            now = datetime.utcnow()
            fresh = now - self.issn.update < timedelta(seconds=SCOPUS_TTL)
            if not fresh and Score.exists(lambda x: x.issn == self.issn and x.year == now.year - 1):
                fresh = True
                self.issn.update = now

            return fresh

        @classmethod
        def update_statistics(cls):
            now = datetime.utcnow()
            journals = list(select(j for j in JournalISSN if j not in
                                   select(s.issn for s in Score if s.year == now.year - 1)).prefetch(Score, Quartile))
            issns = [x.issn for x in journals]
            results = {}
            for i in range(0, len(issns), 25):
                tmp = cls.__do_journal_query(issns[i:i + 25])
                if tmp:
                    results.update(tmp)

            if results:
                journals_dict = {x.issn: x for x in journals}
                journals_scores, journals_ranks = defaultdict(list), defaultdict(list)
                for s in (y for x in journals for y in x.scores):
                    journals_scores[s.issn.issn].append(s.year)

                for r in (y for x in journals for y in x.quartiles):
                    journals_ranks[r.issn.issn].append((r.year, r.subject_code))

                for issn, (score, rank) in results.items():
                    j = journals_dict[issn]
                    for s in score:
                        if s.year not in journals_scores[issn]:
                            Score(year=s.year, score=s.score, issn=j)
                    for r in rank:
                        if (r.year, r.subject_code) not in journals_ranks[issn]:
                            Quartile(year=r.year, subject_code=r.subject_code, percentile=r.percentile, issn=j)
                    flush()

            return True if len(results) == len(issns) else False

        @staticmethod
        def __do_journal_query(issns):
            query = get('https://api.elsevier.com/content/serial/title?issn=%s&count=25&'
                        'view=CITESCORE&field=citeScoreYearInfo,prism:issn' % (','.join(issns)),
                        headers={'Accept': 'application/json', 'X-ELS-APIKey': SCOPUS_API_KEY})

            if query.status_code != 200:
                return None

            data = query.json()
            if 'serial-metadata-response' not in data:
                return None
            if 'entry' not in data['serial-metadata-response']:
                return None

            data = data['serial-metadata-response']['entry']
            results = {}
            for i in data:
                if 'citeScoreYearInfoList' in i:
                    results[i['prism:issn'].replace('-', '')] = score, rank = [], []
                    for x in i['citeScoreYearInfoList']['citeScoreYearInfo']:
                        if x['@status'] == 'Complete':
                            info = x['citeScoreInformationList'][0]['citeScoreInfo'][0]
                            year = int(x['@year'])
                            score.append(year_score(year, float(info['citeScore'])))
                            for y in info['citeScoreSubjectRank']:
                                rank.append(year_rank(year, float(y['percentile']), int(y['subjectCode'])))

            return results

    class Author(db.Entity):
        _table_ = '%s_author' % schema if DEBUG else (schema, 'author')
        id = PrimaryKey(int, auto=True)
        update = Required(datetime)
        surname = Required(str)
        initials = Required(str)
        scopus_id = Required(str, unique=True)
        h_index = Required(int, default=0)
        citations = Required(int, default=0)
        articles = Set('ArticleAuthor')

        @property
        def is_fresh(self):
            return datetime.utcnow() - self.update < timedelta(seconds=SCOPUS_TTL)

        def get_articles(self):
            list(left_join(x.author for x in ArticleAuthor if x.article in
                           select(y.article for y in ArticleAuthor if y.author == self)))  # cache coauthors

            arts = list(left_join(x.article for x in ArticleAuthor if x.author == self)
                        .order_by(desc(Article.date)).prefetch(Journal, JournalISSN))

            authors = defaultdict(list)
            for x in select(x for x in db.ArticleAuthor if x.article in
                            select(a.article for a in db.ArticleAuthor if a.author == self)).order_by(ArticleAuthor.id):
                authors[x.article.id].append(x.author)

            issns = {x.journal.issn for x in arts if x.journal.issn}
            scores, quarts = defaultdict(list), defaultdict(OrderedDict)
            for x in select(x for x in Score if x.issn in issns).order_by(desc(Score.year)):
                scores[x.issn.id].append(x)
            for x in select(x for x in Quartile if x.issn in issns).order_by(desc(Quartile.year)):
                quarts[x.issn.id].setdefault(x.year, []).append(x)

            data = ['***h***-index: **{0.h_index}**, citations count: **{0.citations}**, counted articles: '
                    '**{1}**) *[Provided by SCOPUS API]*\n\n'.format(self, len(arts)),
                    '**List of published articles:**\n\n',
                    '|Published|Meta|Cited Count|CiteScore|Quartiles|\n|---|---|---|---|---|\n']

            f_scores, f_quarts = {}, {}
            for k, v in scores.items():
                f_scores[k] = ', '.join('{0.score:.2f}({0.year})'.format(x) for x in v)
            for k, v in quarts.items():
                tmp = []
                for y, x in v.items():
                    p = max((i.percentile for i in x if i.subject_code in SCOPUS_SUBJECT), default=None)
                    if p is not None:
                        tmp.append('{0}({1})'.format(p > 74 and 'Q1' or p > 49 and 'Q2' or p > 24 and 'Q3' or 'Q4', y))

                f_quarts[k] = ', '.join(tmp)

            for i in arts:
                a = ', '.join('{0.initials} {0.surname}'.format(x) for x in authors[i.id])
                d = datetime.strftime(i.date, '%Y-%m-%d')
                data.append('|**{1}**|*{0.title}* / {2} // ***{0.journal.title}***.— {0.date.year}'.format(i, d, a))
                if i.volume:
                    data.append('.— V.{.volume}'.format(i))
                if i.issue:
                    data.append('.— Is.{.issue}'.format(i))
                if i.pages:
                    data.append('.— P.{.pages}'.format(i))
                if i.doi:
                    data.append(' [[doi](//dx.doi.org/{.doi})]'.format(i))
                if i.journal.issn:
                    score = f_scores.get(i.journal.issn.id, '')
                    quart = f_quarts.get(i.journal.issn.id, '')
                else:
                    score = quart = ''

                data.append('|{0.cited}|{1}|{2}|\n'.format(i, score, quart))

            return ''.join(data)

        @classmethod
        def add_author(cls, scopus_id):
            if cls.exists(scopus_id=scopus_id):
                return False

            data = cls.__get_articles(scopus_id)
            if not data:
                return False

            scopus_id_list = [i.scopus_id for i in data]
            articles = Article.select(lambda x: x.scopus_id in scopus_id_list)
            cls.__update_or_create_article(data, articles)
            return cls.get(scopus_id=scopus_id)

        def update_statistics(self):
            tmp = sorted(left_join(aa.article.cited for aa in ArticleAuthor
                                   if aa.author == self and aa.article.cited > 0).without_distinct(), reverse=True)

            h = 0
            for i in tmp:
                if i > h:
                    h += 1

            if self.h_index != h:
                self.h_index = h
            counted = sum(tmp)
            if self.citations != counted:
                self.citations = counted
            self.update = datetime.utcnow()

        def update_articles(self):
            data = self.__get_articles(self.scopus_id)
            if not data:
                return False

            articles = left_join(aa.article for aa in ArticleAuthor if aa.author == self)
            self.__update_or_create_article(data, articles)
            return True

        @classmethod
        def __update_or_create_article(cls, data, available_articles):
            arts = {x.scopus_id: x for x in available_articles}
            for i in data:
                ae = arts.get(i.scopus_id)
                if ae:
                    if ae.cited != i.cited:
                        ae.cited = i.cited
                else:
                    cls.__add_article(i)

        @staticmethod
        def __add_article(art):
            update = datetime.utcnow() - timedelta(seconds=SCOPUS_TTL)
            art_attrs = {a: v for a, v in ((a, getattr(art, a)) for a in ('volume', 'issue', 'pages', 'doi')) if v}

            if art.issn:
                issn = JournalISSN.get(issn=art.issn)
                if issn is None:
                    journal = Journal.get(title=art.journal) or Journal(title=art.journal)
                    journal.issn = JournalISSN(update=update, issn=art.issn)
                else:
                    journal = issn.journals.filter(lambda x: x.title == art.journal).first() \
                              or Journal(title=art.journal, issn=issn)
            else:
                journal = Journal.get(title=art.journal) or Journal(title=art.journal)

            ae = Article(date=art.date, title=art.title, cited=art.cited, journal=journal, scopus_id=art.scopus_id,
                         **art_attrs)

            sids = [au.scopus_id for au in art.authors]
            authors = {x.scopus_id: x for x in Author.select(lambda x: x.scopus_id in sids)}
            for au in art.authors:
                ArticleAuthor(author=authors.get(au.scopus_id) or
                              Author(update=update, surname=au.surname, initials=au.initials,
                                     scopus_id=au.scopus_id),
                              article=ae)

        @classmethod
        def __get_articles(cls, scopus_id):
            tmp = cls.__do_article_query(scopus_id)
            if not tmp:
                return None

            data, total = tmp
            if total > 25:
                for i in range(1, (total - 1) // 25 + 1):
                    tmp = cls.__do_article_query(scopus_id, page=i)
                    if tmp:
                        data.extend(tmp[0])
            return data

        @staticmethod
        def __do_article_query(scopus_id, page=0):
            query = get('https://api.elsevier.com/content/search/scopus?query=AU-ID(%s)&start=%d'
                        '&count=25&view=COMPLETE&sort=-coverDate,title&suppressNavLinks=true&field=dc:identifier,'
                        'dc:title,prism:publicationName,prism:volume,prism:issueIdentifier,prism:pageRange,'
                        'prism:coverDate,prism:doi,prism:issn,citedby-count,author' % (scopus_id, page * 25),
                        headers={'Accept': 'application/json', 'X-ELS-APIKey': SCOPUS_API_KEY})

            if query.status_code != 200:
                return None

            data = query.json()['search-results']
            total = int(data['opensearch:totalResults'])
            if 'entry' not in data or total == 0:
                return None

            results = [article(authors=OrderedSet(author(surname=x['surname'], initials=x['initials'],
                                                         scopus_id=x['authid']) for x in i['author']),
                               title=i['dc:title'].replace('<sup>', '^(').replace('</sup>', ')')
                                                  .replace('<inf>', '').replace('</inf>', ''),
                               journal=i['prism:publicationName'], volume=i.get('prism:volume'),
                               issue=i.get('prism:issueIdentifier'), pages=i.get('prism:pageRange'),
                               date=datetime.strptime(i['prism:coverDate'], '%Y-%m-%d'), doi=i.get('prism:doi'),
                               cited=int(i['citedby-count']), issn=i.get('prism:issn'), scopus_id=i['dc:identifier'])
                       for i in data['entry'] if 'prism:publicationName' in i]

            return results, total

    class Article(db.Entity):
        _table_ = '%s_article' % schema if DEBUG else (schema, 'article')
        id = PrimaryKey(int, auto=True)
        date = Required(datetime)
        scopus_id = Required(str, unique=True)
        title = Required(str)
        volume = Optional(str)
        issue = Optional(str)
        pages = Optional(str)
        doi = Optional(str)
        cited = Required(int)
        authors = Set('ArticleAuthor')
        journal = Required('Journal')

    class ArticleAuthor(db.Entity):
        _table_ = '%s_article_author' % schema if DEBUG else (schema, 'article_author')
        id = PrimaryKey(int, auto=True)
        author = Required('Author')
        article = Required('Article')

    class Score(db.Entity):
        _table_ = '%s_score' % schema if DEBUG else (schema, 'score')
        id = PrimaryKey(int, auto=True)
        year = Required(int)
        score = Required(float)
        issn = Required('JournalISSN')

    class Quartile(db.Entity):
        _table_ = '%s_quartile' % schema if DEBUG else (schema, 'quartile')
        id = PrimaryKey(int, auto=True)
        year = Required(int)
        subject_code = Required(int)
        percentile = Required(float)
        issn = Required('JournalISSN')

    class JournalISSN(db.Entity):
        _table_ = '%s_issn' % schema if DEBUG else (schema, 'issn')
        id = PrimaryKey(int, auto=True)
        update = Required(datetime)
        issn = Required(str, unique=True)
        scores = Set('Score')
        quartiles = Set('Quartile')
        journals = Set('Journal')

    return Author, Journal
