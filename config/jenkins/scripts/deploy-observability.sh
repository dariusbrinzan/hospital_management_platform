#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(cluster_env_file)"
load_env_file "$(runtime_env_file)"
ensure_runtime_defaults

KUBE_EXECUTION_MODE="${KUBE_EXECUTION_MODE:-local}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-}"
ANSIBLE_INVENTORY="${ANSIBLE_INVENTORY:-}"
OBSERVABILITY_NAMESPACE="${OBSERVABILITY_NAMESPACE:-observability}"
GRAFANA_ADMIN_USER="${GRAFANA_ADMIN_USER:-admin}"
GRAFANA_ADMIN_PASSWORD="${GRAFANA_ADMIN_PASSWORD:-change-me}"
GRAFANA_INGRESS_HOST="${GRAFANA_INGRESS_HOST:-grafana.example.com}"
PROMETHEUS_INGRESS_HOST="${PROMETHEUS_INGRESS_HOST:-prometheus.example.com}"

MANIFEST_FILE="${GENERATED_DIR}/observability-rendered.yaml"

log "Rendering observability manifests for namespace ${OBSERVABILITY_NAMESPACE}"

kubectl kustomize "${CONFIG_ROOT}/k8s/observability/base" > "${MANIFEST_FILE}"

python3 - "${MANIFEST_FILE}" "${OBSERVABILITY_NAMESPACE}" "${GRAFANA_ADMIN_USER}" "${GRAFANA_ADMIN_PASSWORD}" "${GRAFANA_INGRESS_HOST}" "${PROMETHEUS_INGRESS_HOST}" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
namespace = sys.argv[2]
grafana_user = sys.argv[3]
grafana_password = sys.argv[4]
grafana_host = sys.argv[5]
prometheus_host = sys.argv[6]

content = path.read_text()
content = content.replace("observability", namespace)
content = content.replace("change-me-admin-user", grafana_user)
content = content.replace("change-me-admin-password", grafana_password)
content = content.replace("grafana.example.com", grafana_host)
content = content.replace("prometheus.example.com", prometheus_host)
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

write_env_var "$(runtime_env_file)" OBSERVABILITY_NAMESPACE "${OBSERVABILITY_NAMESPACE}"
write_env_var "$(runtime_env_file)" GRAFANA_INGRESS_HOST "${GRAFANA_INGRESS_HOST}"
write_env_var "$(runtime_env_file)" PROMETHEUS_INGRESS_HOST "${PROMETHEUS_INGRESS_HOST}"

log "Observability stack deployed in namespace ${OBSERVABILITY_NAMESPACE}"
