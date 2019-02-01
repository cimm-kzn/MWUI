#!/bin/sh

source venv/bin/activate
ping
exec gunicorn -b :5000 --access-logfile - --error-logfile - CIpress:app
