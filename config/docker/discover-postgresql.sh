#!/bin/sh
set -eu

DISCOVERY_MODE="${DATABASE_AUTODISCOVERY_MODE:-sqlite}"
DISCOVERED_ENV_FILE="${DISCOVERED_DB_ENV_FILE:-/tmp/carepulse-discovered-db.env}"
APP_NAMESPACE="${APP_NAMESPACE:-carepulse}"

shell_quote() {
  printf "'%s'" "$(printf '%s' "${1}" | sed "s/'/'\"'\"'/g")"
}

if [ -n "${DATABASE_URL:-}" ]; then
  {
    echo "export DATABASE_PROVIDER=postgresql"
    echo "export POSTGRES_DISCOVERY_RESULT=preconfigured"
    echo "export DATABASE_URL=$(shell_quote "${DATABASE_URL}")"
  } > "${DISCOVERED_ENV_FILE}"
  exit 0
fi

case "${DISCOVERY_MODE}" in
  sqlite|disabled)
    exit 0
    ;;
esac

POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-carepulse}"
POSTGRES_USER="${POSTGRES_USER:-carepulse}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
POSTGRES_SSLMODE="${POSTGRES_SSLMODE:-disable}"
DB_DISCOVERY_HOSTS="${DB_DISCOVERY_HOSTS:-postgresql postgresql.${APP_NAMESPACE}.svc.cluster.local postgres postgres.${APP_NAMESPACE}.svc.cluster.local}"

for host in ${DB_DISCOVERY_HOSTS}; do
  if getent hosts "${host}" >/dev/null 2>&1; then
    if PGPASSWORD="${POSTGRES_PASSWORD}" pg_isready -h "${host}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then
      {
        echo "export DATABASE_PROVIDER=postgresql"
        echo "export POSTGRES_DISCOVERY_RESULT=discovered"
        echo "export POSTGRES_HOST=$(shell_quote "${host}")"
        echo "export POSTGRES_PORT=$(shell_quote "${POSTGRES_PORT}")"
        echo "export POSTGRES_DB=$(shell_quote "${POSTGRES_DB}")"
        echo "export POSTGRES_USER=$(shell_quote "${POSTGRES_USER}")"
        echo "export POSTGRES_SSLMODE=$(shell_quote "${POSTGRES_SSLMODE}")"
        echo "export DATABASE_URL=$(shell_quote "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${host}:${POSTGRES_PORT}/${POSTGRES_DB}?sslmode=${POSTGRES_SSLMODE}")"
      } > "${DISCOVERED_ENV_FILE}"
      exit 0
    fi
  fi
done

if [ "${DISCOVERY_MODE}" = "postgresql-external" ]; then
  echo "No reachable PostgreSQL instance was discovered, but DATABASE_AUTODISCOVERY_MODE=postgresql-external." >&2
  exit 1
fi

{
  echo "export DATABASE_PROVIDER=${DATABASE_PROVIDER:-sqlite}"
  echo "export POSTGRES_DISCOVERY_RESULT=not-found"
} > "${DISCOVERED_ENV_FILE}"
