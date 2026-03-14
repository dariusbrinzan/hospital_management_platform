#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REPO_ROOT="$(cd "${CONFIG_ROOT}/.." && pwd)"

ENVIRONMENT="${ENVIRONMENT:-dev}"
GENERATED_DIR="${GENERATED_DIR:-${CONFIG_ROOT}/jenkins/generated/${ENVIRONMENT}}"
mkdir -p "${GENERATED_DIR}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
  printf '[%s] ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Comanda necesară nu este disponibilă: $1"
}

load_env_file() {
  local file="$1"
  if [ -f "${file}" ]; then
    # shellcheck disable=SC1090
    set -a && . "${file}" && set +a
  fi
}

write_env_var() {
  local file="$1"
  local key="$2"
  local value="${3:-}"
  mkdir -p "$(dirname "${file}")"
  if [ -f "${file}" ] && grep -q "^${key}=" "${file}"; then
    python3 - "${file}" "${key}" "${value}" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]
lines = path.read_text().splitlines()
with path.open("w") as fh:
    updated = False
    for line in lines:
        if line.startswith(f"{key}="):
            fh.write(f"{key}={value!r}\n")
            updated = True
        else:
            fh.write(f"{line}\n")
    if not updated:
        fh.write(f"{key}={value!r}\n")
PY
  else
    printf '%s=%q\n' "${key}" "${value}" >> "${file}"
  fi
}

ensure_default_image_tag() {
  if [ -z "${IMAGE_TAG:-}" ]; then
    local commit
    commit="$(git -C "${REPO_ROOT}" rev-parse --short HEAD)"
    IMAGE_TAG="${ENVIRONMENT}-${BUILD_NUMBER:-0}-${commit}"
    export IMAGE_TAG
  fi
}

infra_env_file() {
  printf '%s\n' "${GENERATED_DIR}/infra.env"
}

image_env_file() {
  printf '%s\n' "${GENERATED_DIR}/image.env"
}

cluster_env_file() {
  printf '%s\n' "${GENERATED_DIR}/cluster.env"
}

db_env_file() {
  printf '%s\n' "${GENERATED_DIR}/db-discovery.env"
}

runtime_env_file() {
  printf '%s\n' "${GENERATED_DIR}/runtime.env"
}

ensure_runtime_defaults() {
  : "${NAMESPACE:=carepulse}"
  : "${APP_PUBLIC_URL:=https://carepulse.example.com}"
  : "${APP_INGRESS_HOST:=carepulse.example.com}"
  : "${POSTGRES_PORT:=5432}"
  : "${POSTGRES_DB:=carepulse}"
  : "${POSTGRES_USER:=carepulse}"
  : "${POSTGRES_SSLMODE:=disable}"
  : "${DATABASE_MODE:=sqlite}"
  : "${SSH_USER:=ubuntu}"
  export NAMESPACE APP_PUBLIC_URL APP_INGRESS_HOST POSTGRES_PORT POSTGRES_DB POSTGRES_USER POSTGRES_SSLMODE DATABASE_MODE SSH_USER
}

ansible_env_prefix() {
  printf 'ANSIBLE_LOCAL_TEMP=%q ANSIBLE_REMOTE_TEMP=%q' "/tmp/ansible-local" "/tmp/ansible-remote"
}

run_ansible() {
  local inventory="$1"
  shift
  env ANSIBLE_LOCAL_TEMP=/tmp/ansible-local ANSIBLE_REMOTE_TEMP=/tmp/ansible-remote ansible -i "${inventory}" "$@"
}

run_ansible_playbook() {
  local inventory="$1"
  shift
  env ANSIBLE_LOCAL_TEMP=/tmp/ansible-local ANSIBLE_REMOTE_TEMP=/tmp/ansible-remote ansible-playbook -i "${inventory}" "$@"
}

get_control_plane_host() {
  local inventory="$1"
  awk '
    /^\[kube_control_plane\]/ { in_group=1; next }
    /^\[/ { if (in_group) exit; in_group=0 }
    in_group && $1 !~ /^#/ && NF { print $1; exit }
  ' "${inventory}"
}

remote_kubectl_output() {
  local inventory="$1"
  shift
  local host
  host="$(get_control_plane_host "${inventory}")"
  [ -n "${host}" ] || fail "Nu am putut determina control plane host din inventory."
  local cmd="kubectl --kubeconfig=/etc/kubernetes/admin.conf $*"
  local raw
  raw="$(run_ansible "${inventory}" "${host}" -b -m shell -a "${cmd}" 2>/dev/null)"
  printf '%s\n' "${raw}" | sed '1,/>>/d'
}

remote_kubectl_output_allow_fail() {
  local inventory="$1"
  shift
  local host
  host="$(get_control_plane_host "${inventory}")"
  [ -n "${host}" ] || fail "Nu am putut determina control plane host din inventory."
  local cmd="kubectl --kubeconfig=/etc/kubernetes/admin.conf $*"
  local raw
  raw="$(run_ansible "${inventory}" "${host}" -b -m shell -a "${cmd}" 2>/dev/null || true)"
  printf '%s\n' "${raw}" | sed '1,/>>/d'
}

remote_copy_file() {
  local inventory="$1"
  local local_file="$2"
  local remote_file="$3"
  local host
  host="$(get_control_plane_host "${inventory}")"
  [ -n "${host}" ] || fail "Nu am putut determina control plane host din inventory."
  run_ansible "${inventory}" "${host}" -b -m copy -a "src=${local_file} dest=${remote_file} mode=0644"
}

run_kubectl_local() {
  local kubeconfig="$1"
  shift
  if [ -n "${kubeconfig}" ]; then
    KUBECONFIG="${kubeconfig}" kubectl "$@"
  else
    kubectl "$@"
  fi
}

decode_base64() {
  if printf '%s' "${1:-}" | base64 --decode >/dev/null 2>&1; then
    printf '%s' "${1:-}" | base64 --decode
  else
    printf '%s' "${1:-}" | base64 -D
  fi
}

yaml_quote() {
  python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "${1:-}"
}
