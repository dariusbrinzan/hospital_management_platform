#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(cluster_env_file)"
load_env_file "$(runtime_env_file)"
ensure_runtime_defaults

KUBE_EXECUTION_MODE="${KUBE_EXECUTION_MODE:-local}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-}"
ANSIBLE_INVENTORY="${ANSIBLE_INVENTORY:-}"
REDIS_PASSWORD="${REDIS_PASSWORD:-change-me}"
REDIS_STORAGE_SIZE="${REDIS_STORAGE_SIZE:-5Gi}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_DB="${REDIS_DB:-0}"
REDIS_KEY_PREFIX="${REDIS_KEY_PREFIX:-carepulse}"
REQUEST_CACHE_DEFAULT_TTL_SECONDS="${REQUEST_CACHE_DEFAULT_TTL_SECONDS:-60}"

MANIFEST_FILE="${GENERATED_DIR}/redis-rendered.yaml"

log "Rendering Redis manifests for namespace ${NAMESPACE}"

kubectl kustomize "${CONFIG_ROOT}/k8s/redis/base" > "${MANIFEST_FILE}"

python3 - "${MANIFEST_FILE}" "${NAMESPACE}" "${REDIS_PASSWORD}" "${REDIS_STORAGE_SIZE}" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
namespace = sys.argv[2]
password = sys.argv[3]
storage_size = sys.argv[4]

content = path.read_text()
content = content.replace("carepulse", namespace)
content = content.replace("change-me-redis-password", password)
content = content.replace("5Gi", storage_size)
path.write_text(content)
PY

apply_manifest_local() {
  local file="$1"
  run_kubectl_local "${KUBECONFIG_PATH}" apply -f "${file}"
}

apply_manifest_remote() {
  local file="$1"
  local remote_file="/tmp/$(basename "${file}")"
  remote_copy_file "${ANSIBLE_INVENTORY}" "${file}" "${remote_file}" >/dev/null
  remote_kubectl_output "${ANSIBLE_INVENTORY}" "apply -f ${remote_file}" >/dev/null
}

if [ "${KUBE_EXECUTION_MODE}" = "local" ]; then
  apply_manifest_local "${MANIFEST_FILE}"
else
  [ -n "${ANSIBLE_INVENTORY}" ] || fail "ANSIBLE_INVENTORY nu este definit."
  apply_manifest_remote "${MANIFEST_FILE}"
fi

write_env_var "$(runtime_env_file)" ENABLE_REQUEST_CACHE "true"
write_env_var "$(runtime_env_file)" CACHE_PROVIDER "redis"
write_env_var "$(runtime_env_file)" REQUEST_CACHE_DEFAULT_TTL_SECONDS "${REQUEST_CACHE_DEFAULT_TTL_SECONDS}"
write_env_var "$(runtime_env_file)" REDIS_HOST "redis.${NAMESPACE}.svc.cluster.local"
write_env_var "$(runtime_env_file)" REDIS_PORT "${REDIS_PORT}"
write_env_var "$(runtime_env_file)" REDIS_DB "${REDIS_DB}"
write_env_var "$(runtime_env_file)" REDIS_KEY_PREFIX "${REDIS_KEY_PREFIX}"
write_env_var "$(runtime_env_file)" REDIS_PASSWORD "${REDIS_PASSWORD}"
write_env_var "$(runtime_env_file)" REDIS_TLS_ENABLED "false"

log "Redis deployed and request cache runtime variables prepared."
