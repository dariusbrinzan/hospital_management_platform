#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(cluster_env_file)"
load_env_file "$(runtime_env_file)"
ensure_runtime_defaults

KUBE_EXECUTION_MODE="${KUBE_EXECUTION_MODE:-local}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-}"
ANSIBLE_INVENTORY="${ANSIBLE_INVENTORY:-}"

verify_local() {
  run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" rollout status deployment/redis --timeout=300s
  run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" get pods,svc,pvc -l app.kubernetes.io/name=redis -o wide
}

verify_remote() {
  remote_kubectl_output "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} rollout status deployment/redis --timeout=300s" >/dev/null
  remote_kubectl_output "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} get pods,svc,pvc -l app.kubernetes.io/name=redis -o wide"
}

if [ "${KUBE_EXECUTION_MODE}" = "local" ]; then
  verify_local
else
  [ -n "${ANSIBLE_INVENTORY}" ] || fail "ANSIBLE_INVENTORY nu este definit."
  verify_remote
fi

log "Redis verification checks completed."
