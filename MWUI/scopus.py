# -*- coding: utf-8 -*-
#
#  Copyright 2016, 2017 Ramil Nugmanov <stsouko@live.ru>
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
from collections import MutableSet, namedtuple
from pickle import dumps, loads
from redis import Redis, ConnectionError
from requests import get


class OrderedSet(MutableSet):
    def __init__(self, iterable=None):
        self.end = end = []
        end += [None, end, end]         # sentinel node for doubly linked list
        self.map = {}                   # key --> [key, prev, next]
        if iterable is not None:
            self |= iterable

    def __len__(self):
        return len(self.map)

    def __contains__(self, key):
        return key in self.map

    def add(self, key):
        if key not in self.map:
            end = self.end
            curr = end[1]
            curr[2] = end[1] = self.map[key] = [key, curr, end]

    def discard(self, key):
        if key in self.map:
            key, prev, next = self.map.pop(key)
            prev[2] = next
            next[1] = prev

    def __iter__(self):
        end = self.end
        curr = end[2]
        while curr is not end:
            yield curr[0]
            curr = curr[2]

    def __reversed__(self):
        end = self.end
        curr = end[1]
        while curr is not end:
            yield curr[0]
            curr = curr[1]

    def pop(self, last=True):
        if not self:
            raise KeyError('set is empty')
        key = self.end[1][0] if last else self.end[2][0]
        self.discard(key)
        return key

    def __repr__(self):
        if not self:
            return '%s()' % (self.__class__.__name__,)
        return '%s(%r)' % (self.__class__.__name__, list(self))

    def __eq__(self, other):
        if isinstance(other, OrderedSet):
            return len(self) == len(other) and list(self) == list(other)
        return set(self) == set(other)


class Scopus:
    def __init__(self, api_key, subject=('1600',), redis_ttl=86400, redis_host='localhost', redis_port=6379,
                 redis_password=None):
        self.__api_key = api_key
        self.__redis_ttl = redis_ttl
        self.__subj = tuple(subject)
        self.__cache = Redis(host=redis_host, port=redis_port, password=redis_password)

    def get_articles(self, author_id):
        try:
            self.__cache.ping()
        except ConnectionError:
            return None

        result = self.__cache.get('SCOPUS_%s' % author_id)
        if result:
            return result.decode()

        metrics = self.__get_metrics(author_id)
        if not metrics:
            return None

        articles = self.__get_articles(author_id)
        if not articles:
            return None

        issns = {x.issn for x in articles if x.issn}
        journals = {}
        for i in issns:
            tmp = self.__cache.get('ISSN_%s' % i)
            if tmp:
                journals[i] = [self.__year(*y) for y in loads(tmp)]

        for k, v in self.__get_journals(list(issns.difference(journals))).items():
            journals[k] = v
            self.__cache.set('ISSN_%s' % k, dumps([tuple(y) for y in v]), ex=self.__redis_ttl * 4)

        data = ['***h***-index: **{0.h_index}**, citations count: **{0.citations}**, counted articles: '
                '**{0.documents}**) *[Provided by SCOPUS API]*\n\n'.format(metrics),
                '**List of published articles:**\n\n',
                '|Published|Meta|Cited Count|CiteScore|Quartiles|\n|---|---|---|---|---|\n']

        for i in articles:
            data.append('|**{0.date}**|*{0.title}* / {0.authors} // ***{0.journal}.***.- {0.date}'.format(i))
            if i.volume:
                data.append(' V.{.volume}.'.format(i))
            if i.issue:
                data.append(' Is.{.issue}.'.format(i))
            if i.pages:
                data.append(' P.{.pages}'.format(i))
            if i.doi:
                data.append(' [[doi](//dx.doi.org/{.doi})]'.format(i))

            score = ', '.join('{0.score:.2f}({0.year})'.format(y) for y in journals.get(i.issn, []))
            quarts = ', '.join('{0}({1})'.format(y.rank > 74 and 'Q1' or y.rank > 49 and 'Q2' or y.rank > 24 and 'Q3'
                                                 or 'Q4', y.year)
                               for y in journals.get(i.issn, []) if y.rank is not None)
            data.append('|{0.cited}|{1}|{2}|\n'.format(i, score, quarts))

        result = ''.join(data)
        self.__cache.set('SCOPUS_%s' % author_id, result.encode(), ex=self.__redis_ttl)
        return result

    __metric = namedtuple('Metrics', ['h_index', 'citations', 'documents'])
    __art = namedtuple('Article', ['authors', 'title', 'journal', 'volume', 'issue',
                                   'pages', 'date', 'doi', 'cited', 'issn'])
    __year = namedtuple('YearMetric', ['year', 'score', 'rank'])

    def __get_metrics(self, author_id):
        metrics = get("https://api.elsevier.com/content/author/author_id/%s?view=METRICS" % author_id,
                      headers={'Accept': 'application/json', 'X-ELS-APIKey': self.__api_key})
        if metrics.status_code == 200:
            a = metrics.json()['author-retrieval-response'][0]
            return self.__metric(a['h-index'], a['coredata']['citation-count'], a['coredata']['document-count'])

    def __get_articles(self, author_id):
        tmp = self.__do_article_query(author_id)
        if not tmp:
            return None

        data, total = tmp
        if total > 25:
            for i in range(1, (total - 1) // 25 + 1):
                tmp = self.__do_article_query(author_id, page=i)
                if not tmp:
                    return None
                data.extend(tmp[0])

        return data

    def __get_journals(self, issns):
        results = {}
        for i in range(0, len(issns), 25):
            tmp = self.__do_journal_query(issns[i:i + 25])
            if tmp:
                results.update(tmp)

        return results

    def __do_article_query(self, author_id, page=0):
        query = get('https://api.elsevier.com/content/search/scopus?query=AU-ID(%s)&start=%d'
                    '&count=25&view=COMPLETE&sort=-coverDate,title&suppressNavLinks=true&field=dc:title,'
                    'prism:publicationName,prism:volume,prism:issueIdentifier,prism:pageRange,prism:coverDate,'
                    'prism:doi,prism:issn,citedby-count,affiliation,author' % (author_id, page * 25),
                    headers={'Accept': 'application/json', 'X-ELS-APIKey': self.__api_key})

        if query.status_code != 200:
            return None

        data = query.json()['search-results']
        total = int(data['opensearch:totalResults'])
        if 'entry' not in data or total == 0:
            return None

        results = [self.__art(authors=', '.join(OrderedSet('{0[initials]} {0[surname]}'.format(x)
                                                           for x in i["author"])),
                              title=i['dc:title'].replace('<sup>', '^(').replace('</sup>', ')')
                                                 .replace('<inf>', '').replace('</inf>', ''),
                              journal=i['prism:publicationName'], volume=i.get('prism:volume'),
                              issue=i.get('prism:issueIdentifier'), pages=i.get('prism:pageRange'),
                              date=(i.get('prism:coverDate') or 'NA'), doi=i.get('prism:doi'), cited=i['citedby-count'],
                              issn=i.get('prism:issn')) for i in data['entry'] if 'prism:publicationName' in i]

        return results, total

    def __do_journal_query(self, issns):
        query = get('https://api.elsevier.com/content/serial/title?issn=%s&count=25&'
                    'view=CITESCORE&field=citeScoreYearInfo,prism:issn' % (','.join(issns)),
                    headers={'Accept': 'application/json', 'X-ELS-APIKey': self.__api_key})

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
                results[i['prism:issn'].replace('-', '')] = tmp = []
                for x in i['citeScoreYearInfoList']['citeScoreYearInfo']:
                    if x['@status'] == 'Complete':
                        rank = x['citeScoreInformationList'][0]['citeScoreInfo'][0]
                        sub = max((y for y in rank['citeScoreSubjectRank'] if y['subjectCode'].startswith(self.__subj)),
                                  key=lambda k: int(k['percentile']), default=None)
                        pers = int(sub['percentile']) if sub else None
                        tmp.append(self.__year(int(x['@year']), float(rank['citeScore']), pers))

        return results
