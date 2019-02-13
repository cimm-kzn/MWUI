FROM python:3.7-alpine

RUN adduser -D cimm

WORKDIR /home/cimm

COPY requirements.txt requirements.txt
RUN python -m venv venv

RUN apk add --no-cache postgresql-libs && \
    apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev libffi-dev && \
    venv/bin/pip install -r requirements.txt --no-cache-dir && \
    apk --purge del .build-deps

RUN venv/bin/pip install gunicorn

COPY CIevent CIevent
COPY boot.sh ./
RUN chmod +x boot.sh

ENV FLASK_APP CIevent

RUN chown -R cimm:cimm ./
USER cimm

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]
