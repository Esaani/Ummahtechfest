#!/bin/sh
set -e

python manage.py migrate --noinput || echo "WARN: migrations failed (is Postgres running?)"

if [ "${SEED_ON_START:-true}" != "false" ]; then
  python manage.py seed --verbosity=1 || echo "WARN: seed failed (check logs)"
fi

if [ "${RUN_COLLECTSTATIC:-false}" = "true" ]; then
  python manage.py collectstatic --noinput || echo "WARN: collectstatic failed"
fi

exec "$@"
