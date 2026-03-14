#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(infra_env_file)"
load_env_file "$(cluster_env_file)"
ensure_runtime_defaults

KUBECONFIG_FILE="${KUBECONFIG_PATH:-${GENERATED_DIR}/kubeconfig}"

case "${TARGET_PLATFORM:-}" in
  aws-eks)
    require_cmd aws
    require_cmd kubectl
    [ -n "${EKS_CLUSTER_NAME:-}" ] || fail "EKS_CLUSTER_NAME nu este definit."
    aws eks update-kubeconfig --region "${AWS_REGION:-eu-central-1}" --name "${EKS_CLUSTER_NAME}" --kubeconfig "${KUBECONFIG_FILE}"
    ;;
  azure-aks)
    require_cmd az
    require_cmd kubectl
    [ -n "${AKS_RESOURCE_GROUP:-}" ] || fail "AKS_RESOURCE_GROUP nu este definit."
    [ -n "${AKS_CLUSTER_NAME:-}" ] || fail "AKS_CLUSTER_NAME nu este definit."
    az aks get-credentials --resource-group "${AKS_RESOURCE_GROUP}" --name "${AKS_CLUSTER_NAME}" --file "${KUBECONFIG_FILE}" --overwrite-existing
    ;;
  *)
    fail "acquire-managed-kubeconfig.sh a fost chemat pentru o țintă nesuportată: ${TARGET_PLATFORM:-}"
    ;;
esac

write_env_var "$(cluster_env_file)" KUBECONFIG_PATH "${KUBECONFIG_FILE}"
write_env_var "$(cluster_env_file)" MANAGED_CLUSTER_READY true

log "Managed cluster kubeconfig saved to ${KUBECONFIG_FILE}"

