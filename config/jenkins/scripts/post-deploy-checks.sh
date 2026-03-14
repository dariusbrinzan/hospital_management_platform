#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(cluster_env_file)"
load_env_file "$(runtime_env_file)"
ensure_runtime_defaults

KUBE_EXECUTION_MODE="${KUBE_EXECUTION_MODE:-local}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-}"
ANSIBLE_INVENTORY="${ANSIBLE_INVENTORY:-}"
RUN_SMOKE_TEST="${RUN_SMOKE_TEST:-false}"

if [ "${KUBE_EXECUTION_MODE}" = "local" ]; then
  run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" rollout status deployment/carepulse --timeout=300s
  run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" get pods,svc,ingress -o wide
else
  remote_kubectl_output "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} rollout status deployment/carepulse --timeout=300s" >/dev/null
  remote_kubectl_output "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} get pods,svc,ingress -o wide"
fi

if [ "${RUN_SMOKE_TEST}" = "true" ]; then
  require_cmd curl
  curl -fsS -m 20 "${APP_PUBLIC_URL}" >/dev/null
  log "Smoke test against ${APP_PUBLIC_URL} succeeded."
fi

log "Post-deploy checks completed."

