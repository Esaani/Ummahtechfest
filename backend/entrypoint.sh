#!/bin/sh
set -e
python manage.py migrate --noinput || echo "WARN: migrations failed (is Postgres running?)"
python manage.py seed --verbosity=1 || echo "WARN: seed failed (check logs)"
exec "$@"
