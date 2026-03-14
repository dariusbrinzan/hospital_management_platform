#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(infra_env_file)"
load_env_file "$(cluster_env_file)"
ensure_runtime_defaults

INVENTORY_FILE="${ANSIBLE_INVENTORY:-}"
[ -n "${INVENTORY_FILE}" ] || fail "ANSIBLE_INVENTORY nu este definit."

CONTROL_PLANE_ENDPOINT="${CONTROL_PLANE_ENDPOINT:-${CONTROL_PLANE_PRIVATE_IP:-cp1.internal.example.com}:6443}"

log "Bootstrapping self-managed cluster using inventory ${INVENTORY_FILE}"

run_ansible_playbook "${INVENTORY_FILE}" "${CONFIG_ROOT}/ansible/playbooks/bootstrap.yml"
run_ansible_playbook "${INVENTORY_FILE}" "${CONFIG_ROOT}/ansible/playbooks/init-control-plane.yml" \
  -e "control_plane_endpoint=${CONTROL_PLANE_ENDPOINT}"
run_ansible_playbook "${INVENTORY_FILE}" "${CONFIG_ROOT}/ansible/playbooks/join-workers.yml"

if command -v ansible >/dev/null 2>&1; then
  log "Fetching admin kubeconfig for troubleshooting"
  mkdir -p "${GENERATED_DIR}"
  host="$(get_control_plane_host "${INVENTORY_FILE}")"
  env ANSIBLE_LOCAL_TEMP=/tmp/ansible-local ANSIBLE_REMOTE_TEMP=/tmp/ansible-remote \
    ansible -i "${INVENTORY_FILE}" "${host}" -b -m fetch \
      -a "src=/etc/kubernetes/admin.conf dest=${GENERATED_DIR}/admin.conf flat=yes" >/dev/null
fi

write_env_var "$(cluster_env_file)" SELF_MANAGED_CLUSTER_READY true
write_env_var "$(cluster_env_file)" CONTROL_PLANE_ENDPOINT "${CONTROL_PLANE_ENDPOINT}"

log "Self-managed cluster configured."

