#!/bin/sh
set -eu

if [ "${ENABLE_DB_AUTODISCOVERY:-true}" = "true" ]; then
  /opt/carepulse/bin/discover-postgresql.sh || true
fi

if [ -f "${DISCOVERED_DB_ENV_FILE:-/tmp/carepulse-discovered-db.env}" ]; then
  # shellcheck disable=SC1090
  . "${DISCOVERED_DB_ENV_FILE:-/tmp/carepulse-discovered-db.env}"
fi

exec "$@"

