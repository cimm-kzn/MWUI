FROM python:3.7-alpine

RUN adduser -D cimm

WORKDIR /home/cimm

COPY requirements.txt requirements.txt

RUN python -m venv venv && \
    apk add --no-cache postgresql-libs && \
    apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev libffi-dev && \
    venv/bin/pip install -r requirements.txt --no-cache-dir && \
    venv/bin/pip install --no-cache-dir gunicorn && \
    apk --purge del .build-deps

COPY CIMMBlog CIMMBlog
COPY boot.sh ./

ENV FLASK_APP CIMMBlog

USER cimm

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]
