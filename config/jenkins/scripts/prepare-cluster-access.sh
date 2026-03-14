#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

ensure_runtime_defaults
load_env_file "$(infra_env_file)"

CLUSTER_ENV="$(cluster_env_file)"
: > "${CLUSTER_ENV}"

if [ "${TARGET_PLATFORM:-onprem}" = "aws-ec2" ] || [ "${TARGET_PLATFORM:-onprem}" = "onprem" ]; then
  INVENTORY_FILE="${GENERATED_DIR}/ansible-hosts.ini"

  if [ "${TARGET_PLATFORM:-onprem}" = "onprem" ]; then
    if [ -n "${ONPREM_INVENTORY_PATH:-}" ]; then
      cp "${ONPREM_INVENTORY_PATH}" "${INVENTORY_FILE}"
    else
      cp "${CONFIG_ROOT}/ansible/inventories/onprem/hosts.ini" "${INVENTORY_FILE}"
    fi
  else
    [ -n "${CONTROL_PLANE_PRIVATE_IP:-}" ] || fail "CONTROL_PLANE_PRIVATE_IP lipsește din output-ul de infrastructură."
    [ -n "${BASTION_PUBLIC_IP:-}" ] || fail "BASTION_PUBLIC_IP lipsește din output-ul de infrastructură."
    [ -n "${WORKER_PRIVATE_IPS:-}" ] || fail "WORKER_PRIVATE_IPS lipsește din output-ul de infrastructură."

    {
      echo "[kube_control_plane]"
      echo "cp1 ansible_host=${CONTROL_PLANE_PRIVATE_IP} node_ip=${CONTROL_PLANE_PRIVATE_IP} ansible_ssh_common_args='-o ProxyJump=${SSH_USER}@${BASTION_PUBLIC_IP}'"
      echo
      echo "[kube_workers]"
      index=1
      IFS=',' read -r -a workers <<< "${WORKER_PRIVATE_IPS}"
      for worker_ip in "${workers[@]}"; do
        [ -n "${worker_ip}" ] || continue
        echo "worker${index} ansible_host=${worker_ip} node_ip=${worker_ip} ansible_ssh_common_args='-o ProxyJump=${SSH_USER}@${BASTION_PUBLIC_IP}'"
        index=$((index + 1))
      done
      echo
      echo "[k8s_cluster:children]"
      echo "kube_control_plane"
      echo "kube_workers"
      echo
      echo "[all:vars]"
      echo "ansible_user=${SSH_USER}"
      echo "ansible_become=true"
    } > "${INVENTORY_FILE}"
  fi

  write_env_var "${CLUSTER_ENV}" ANSIBLE_INVENTORY "${INVENTORY_FILE}"
  write_env_var "${CLUSTER_ENV}" KUBE_EXECUTION_MODE remote-ansible
fi

if [ "${TARGET_PLATFORM:-onprem}" = "aws-eks" ] || [ "${TARGET_PLATFORM:-onprem}" = "azure-aks" ]; then
  KUBECONFIG_FILE="${GENERATED_DIR}/kubeconfig"
  write_env_var "${CLUSTER_ENV}" KUBE_EXECUTION_MODE local
  write_env_var "${CLUSTER_ENV}" KUBECONFIG_PATH "${KUBECONFIG_FILE}"
fi

log "Cluster access metadata written to ${CLUSTER_ENV}"

