#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(cluster_env_file)"
ensure_runtime_defaults

DB_ENV_FILE="$(db_env_file)"
: > "${DB_ENV_FILE}"

DATABASE_MODE="${DATABASE_MODE:-sqlite}"
AUTO_DISCOVER_POSTGRES="${AUTO_DISCOVER_POSTGRES:-true}"
EXISTING_POSTGRES_SECRET_NAME="${EXISTING_POSTGRES_SECRET_NAME:-}"
EXISTING_POSTGRES_SERVICE_NAME="${EXISTING_POSTGRES_SERVICE_NAME:-}"

if [ "${DATABASE_MODE}" = "sqlite" ]; then
  write_env_var "${DB_ENV_FILE}" DB_OVERLAY sqlite
  write_env_var "${DB_ENV_FILE}" DB_DISCOVERY_RESULT disabled
  log "Database mode is sqlite; skipping PostgreSQL discovery."
  exit 0
fi

if [ "${AUTO_DISCOVER_POSTGRES}" != "true" ] && [ "${DATABASE_MODE}" = "postgresql-auto" ]; then
  write_env_var "${DB_ENV_FILE}" DB_OVERLAY postgresql
  write_env_var "${DB_ENV_FILE}" DB_DISCOVERY_RESULT skipped
  log "Auto-discovery disabled; falling back to embedded PostgreSQL overlay."
  exit 0
fi

KUBE_EXECUTION_MODE="${KUBE_EXECUTION_MODE:-local}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-}"
ANSIBLE_INVENTORY="${ANSIBLE_INVENTORY:-}"

get_secret_json() {
  local secret_name="$1"
  if [ "${KUBE_EXECUTION_MODE}" = "local" ]; then
    run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" get secret "${secret_name}" -o json 2>/dev/null || true
  else
    remote_kubectl_output_allow_fail "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} get secret ${secret_name} -o json"
  fi
}

get_service_json() {
  local service_name="$1"
  if [ "${KUBE_EXECUTION_MODE}" = "local" ]; then
    run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" get svc "${service_name}" -o json 2>/dev/null || true
  else
    remote_kubectl_output_allow_fail "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} get svc ${service_name} -o json"
  fi
}

list_services_json() {
  if [ "${KUBE_EXECUTION_MODE}" = "local" ]; then
    run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" get svc -o json 2>/dev/null || true
  else
    remote_kubectl_output_allow_fail "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} get svc -o json"
  fi
}

decode_key_from_secret() {
  local secret_json="$1"
  shift
  local key
  for key in "$@"; do
    local raw
    raw="$(printf '%s' "${secret_json}" | jq -r --arg key "${key}" '.data[$key] // empty')"
    if [ -n "${raw}" ] && [ "${raw}" != "null" ]; then
      decode_base64 "${raw}"
      return 0
    fi
  done
  return 1
}

SECRET_CANDIDATES=()
if [ -n "${EXISTING_POSTGRES_SECRET_NAME}" ]; then
  SECRET_CANDIDATES+=("${EXISTING_POSTGRES_SECRET_NAME}")
fi
SECRET_CANDIDATES+=(postgresql-secrets postgresql postgres postgresql-credentials)

SERVICE_CANDIDATES=()
if [ -n "${EXISTING_POSTGRES_SERVICE_NAME}" ]; then
  SERVICE_CANDIDATES+=("${EXISTING_POSTGRES_SERVICE_NAME}")
fi
SERVICE_CANDIDATES+=(postgresql postgres postgresql-primary)

FOUND_SECRET=""
FOUND_SERVICE=""
SECRET_JSON=""
SERVICE_JSON=""

for secret_name in "${SECRET_CANDIDATES[@]}"; do
  [ -n "${secret_name}" ] || continue
  candidate="$(get_secret_json "${secret_name}")"
  if [ -n "${candidate}" ]; then
    FOUND_SECRET="${secret_name}"
    SECRET_JSON="${candidate}"
    break
  fi
done

for service_name in "${SERVICE_CANDIDATES[@]}"; do
  [ -n "${service_name}" ] || continue
  candidate="$(get_service_json "${service_name}")"
  if [ -n "${candidate}" ]; then
    FOUND_SERVICE="${service_name}"
    SERVICE_JSON="${candidate}"
    break
  fi
done

if [ -z "${FOUND_SERVICE}" ]; then
  services_json="$(list_services_json)"
  if [ -n "${services_json}" ]; then
    FOUND_SERVICE="$(printf '%s' "${services_json}" | jq -r '.items[] | select(any(.spec.ports[]?; (.port == 5432) or (.targetPort == 5432))) | .metadata.name' | head -n1)"
    if [ -n "${FOUND_SERVICE}" ]; then
      SERVICE_JSON="$(get_service_json "${FOUND_SERVICE}")"
    fi
  fi
fi

DATABASE_URL_VALUE="${DATABASE_URL:-}"
POSTGRES_HOST_VALUE="${POSTGRES_HOST:-}"
POSTGRES_DB_VALUE="${POSTGRES_DB:-carepulse}"
POSTGRES_USER_VALUE="${POSTGRES_USER:-carepulse}"
POSTGRES_PASSWORD_VALUE="${POSTGRES_PASSWORD:-}"
POSTGRES_PORT_VALUE="${POSTGRES_PORT:-5432}"

if [ -n "${SECRET_JSON}" ]; then
  DATABASE_URL_VALUE="${DATABASE_URL_VALUE:-$(decode_key_from_secret "${SECRET_JSON}" DATABASE_URL database_url postgres_url postgresql-uri 2>/dev/null || true)}"
  POSTGRES_DB_VALUE="$(decode_key_from_secret "${SECRET_JSON}" POSTGRES_DB database postgresql-database 2>/dev/null || printf '%s' "${POSTGRES_DB_VALUE}")"
  POSTGRES_USER_VALUE="$(decode_key_from_secret "${SECRET_JSON}" POSTGRES_USER username user postgresql-username 2>/dev/null || printf '%s' "${POSTGRES_USER_VALUE}")"
  POSTGRES_PASSWORD_VALUE="$(decode_key_from_secret "${SECRET_JSON}" POSTGRES_PASSWORD password postgresql-password 2>/dev/null || printf '%s' "${POSTGRES_PASSWORD_VALUE}")"
fi

if [ -n "${SERVICE_JSON}" ]; then
  POSTGRES_HOST_VALUE="${POSTGRES_HOST_VALUE:-$(printf '%s' "${SERVICE_JSON}" | jq -r '.metadata.name + "." + .metadata.namespace + ".svc.cluster.local"')}"
  port_from_svc="$(printf '%s' "${SERVICE_JSON}" | jq -r '.spec.ports[]? | select(.port == 5432 or .targetPort == 5432) | (.port|tostring)' | head -n1)"
  if [ -n "${port_from_svc}" ] && [ "${port_from_svc}" != "null" ]; then
    POSTGRES_PORT_VALUE="${port_from_svc}"
  fi
fi

if [ -z "${DATABASE_URL_VALUE}" ] && [ -n "${POSTGRES_HOST_VALUE}" ] && [ -n "${POSTGRES_USER_VALUE}" ] && [ -n "${POSTGRES_PASSWORD_VALUE}" ]; then
  DATABASE_URL_VALUE="postgresql://${POSTGRES_USER_VALUE}:${POSTGRES_PASSWORD_VALUE}@${POSTGRES_HOST_VALUE}:${POSTGRES_PORT_VALUE}/${POSTGRES_DB_VALUE}?sslmode=${POSTGRES_SSLMODE:-disable}"
fi

if [ -n "${DATABASE_URL_VALUE}" ] || [ -n "${FOUND_SERVICE}" ]; then
  write_env_var "${DB_ENV_FILE}" DB_OVERLAY external-postgresql
  write_env_var "${DB_ENV_FILE}" DB_DISCOVERY_RESULT found
  write_env_var "${DB_ENV_FILE}" DB_SECRET_NAME "${FOUND_SECRET}"
  write_env_var "${DB_ENV_FILE}" DB_SERVICE_NAME "${FOUND_SERVICE}"
  write_env_var "${DB_ENV_FILE}" DATABASE_URL "${DATABASE_URL_VALUE}"
  write_env_var "${DB_ENV_FILE}" POSTGRES_HOST "${POSTGRES_HOST_VALUE}"
  write_env_var "${DB_ENV_FILE}" POSTGRES_PORT "${POSTGRES_PORT_VALUE}"
  write_env_var "${DB_ENV_FILE}" POSTGRES_DB "${POSTGRES_DB_VALUE}"
  write_env_var "${DB_ENV_FILE}" POSTGRES_USER "${POSTGRES_USER_VALUE}"
  write_env_var "${DB_ENV_FILE}" POSTGRES_PASSWORD "${POSTGRES_PASSWORD_VALUE}"
  log "Discovered existing PostgreSQL service ${FOUND_SERVICE:-unknown}."
  exit 0
fi

case "${DATABASE_MODE}" in
  postgresql-external)
    fail "A fost cerut postgresql-external, dar nu s-a găsit nicio bază existentă."
    ;;
  postgresql-auto|postgresql-embedded)
    write_env_var "${DB_ENV_FILE}" DB_OVERLAY postgresql
    write_env_var "${DB_ENV_FILE}" DB_DISCOVERY_RESULT not-found
    write_env_var "${DB_ENV_FILE}" POSTGRES_HOST "postgresql.${NAMESPACE}.svc.cluster.local"
    write_env_var "${DB_ENV_FILE}" POSTGRES_PORT "${POSTGRES_PORT_VALUE}"
    write_env_var "${DB_ENV_FILE}" POSTGRES_DB "${POSTGRES_DB_VALUE}"
    write_env_var "${DB_ENV_FILE}" POSTGRES_USER "${POSTGRES_USER_VALUE}"
    write_env_var "${DB_ENV_FILE}" POSTGRES_PASSWORD "${POSTGRES_PASSWORD_VALUE:-change-me}"
    log "No existing PostgreSQL found. Falling back to embedded PostgreSQL overlay."
    ;;
  *)
    fail "DATABASE_MODE necunoscut: ${DATABASE_MODE}"
    ;;
esac
