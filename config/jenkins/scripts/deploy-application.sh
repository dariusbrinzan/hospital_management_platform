#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

load_env_file "$(image_env_file)"
load_env_file "$(cluster_env_file)"
load_env_file "$(db_env_file)"
ensure_runtime_defaults

DB_OVERLAY="${DB_OVERLAY:-sqlite}"
IMAGE_REF="${IMAGE_REF:-${IMAGE_REPOSITORY:-ghcr.io/example/carepulse}:${IMAGE_TAG:-latest}}"
KUBE_EXECUTION_MODE="${KUBE_EXECUTION_MODE:-local}"
KUBECONFIG_PATH="${KUBECONFIG_PATH:-}"
ANSIBLE_INVENTORY="${ANSIBLE_INVENTORY:-}"

MANIFEST_FILE="${GENERATED_DIR}/carepulse-rendered.yaml"
CONFIGMAP_FILE="${GENERATED_DIR}/carepulse-configmap.yaml"
SECRET_FILE="${GENERATED_DIR}/carepulse-secret.yaml"

log "Rendering Kubernetes manifests for overlay ${DB_OVERLAY}"

kubectl kustomize "${CONFIG_ROOT}/k8s/overlays/${DB_OVERLAY}" > "${MANIFEST_FILE}"

python3 - "${MANIFEST_FILE}" "${IMAGE_REF}" "${APP_INGRESS_HOST}" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
image = sys.argv[2]
host = sys.argv[3]
content = path.read_text()
content = content.replace("ghcr.io/example/carepulse:latest", image)
content = content.replace("carepulse.example.com", host)
path.write_text(content)
PY

DB_DISCOVERY_HOSTS="${DB_DISCOVERY_HOSTS:-postgresql postgresql.${NAMESPACE}.svc.cluster.local postgres postgres.${NAMESPACE}.svc.cluster.local}"
POSTGRES_HOST="${POSTGRES_HOST:-postgresql.${NAMESPACE}.svc.cluster.local}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-carepulse}"
POSTGRES_USER="${POSTGRES_USER:-carepulse}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-change-me}"
DATABASE_URL="${DATABASE_URL:-}"
CRON_SECRET="${CRON_SECRET:-change-me}"
NEXT_PUBLIC_ADMIN_PASSKEY="${NEXT_PUBLIC_ADMIN_PASSKEY:-111111}"
APP_PUBLIC_URL_YAML="$(yaml_quote "${APP_PUBLIC_URL}")"
DATABASE_MODE_YAML="$(yaml_quote "${DATABASE_MODE}")"
NAMESPACE_YAML="$(yaml_quote "${NAMESPACE}")"
DB_DISCOVERY_HOSTS_YAML="$(yaml_quote "${DB_DISCOVERY_HOSTS}")"
POSTGRES_HOST_YAML="$(yaml_quote "${POSTGRES_HOST}")"
POSTGRES_DB_YAML="$(yaml_quote "${POSTGRES_DB}")"
POSTGRES_SSLMODE_YAML="$(yaml_quote "${POSTGRES_SSLMODE:-disable}")"
NEXT_PUBLIC_ADMIN_PASSKEY_YAML="$(yaml_quote "${NEXT_PUBLIC_ADMIN_PASSKEY}")"
CRON_SECRET_YAML="$(yaml_quote "${CRON_SECRET}")"
DATABASE_URL_YAML="$(yaml_quote "${DATABASE_URL}")"
POSTGRES_USER_YAML="$(yaml_quote "${POSTGRES_USER}")"
POSTGRES_PASSWORD_YAML="$(yaml_quote "${POSTGRES_PASSWORD}")"
SENTRY_DSN_YAML="$(yaml_quote "${SENTRY_DSN:-}")"
SENTRY_AUTH_TOKEN_YAML="$(yaml_quote "${SENTRY_AUTH_TOKEN:-}")"
TWILIO_ACCOUNT_SID_YAML="$(yaml_quote "${TWILIO_ACCOUNT_SID:-}")"
TWILIO_AUTH_TOKEN_YAML="$(yaml_quote "${TWILIO_AUTH_TOKEN:-}")"
TWILIO_PHONE_NUMBER_YAML="$(yaml_quote "${TWILIO_PHONE_NUMBER:-}")"

cat > "${CONFIGMAP_FILE}" <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: carepulse-config
  namespace: ${NAMESPACE}
data:
  NODE_ENV: production
  PORT: "3000"
  HOSTNAME: "0.0.0.0"
  NEXT_PUBLIC_APP_URL: ${APP_PUBLIC_URL_YAML}
  DATABASE_PROVIDER: sqlite
  SQLITE_DATABASE_PATH: /app/data/carepulse.db
  ENABLE_DB_AUTODISCOVERY: "true"
  DATABASE_AUTODISCOVERY_MODE: ${DATABASE_MODE_YAML}
  APP_NAMESPACE: ${NAMESPACE_YAML}
  DB_DISCOVERY_HOSTS: ${DB_DISCOVERY_HOSTS_YAML}
  POSTGRES_HOST: ${POSTGRES_HOST_YAML}
  POSTGRES_PORT: "${POSTGRES_PORT}"
  POSTGRES_DB: ${POSTGRES_DB_YAML}
  POSTGRES_SSLMODE: ${POSTGRES_SSLMODE_YAML}
EOF

cat > "${SECRET_FILE}" <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: carepulse-secrets
  namespace: ${NAMESPACE}
type: Opaque
stringData:
  NEXT_PUBLIC_ADMIN_PASSKEY: ${NEXT_PUBLIC_ADMIN_PASSKEY_YAML}
  CRON_SECRET: ${CRON_SECRET_YAML}
  DATABASE_URL: ${DATABASE_URL_YAML}
  POSTGRES_USER: ${POSTGRES_USER_YAML}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD_YAML}
  SENTRY_DSN: ${SENTRY_DSN_YAML}
  SENTRY_AUTH_TOKEN: ${SENTRY_AUTH_TOKEN_YAML}
  TWILIO_ACCOUNT_SID: ${TWILIO_ACCOUNT_SID_YAML}
  TWILIO_AUTH_TOKEN: ${TWILIO_AUTH_TOKEN_YAML}
  TWILIO_PHONE_NUMBER: ${TWILIO_PHONE_NUMBER_YAML}
EOF

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
  apply_manifest_local "${CONFIGMAP_FILE}"
  apply_manifest_local "${SECRET_FILE}"
  run_kubectl_local "${KUBECONFIG_PATH}" -n "${NAMESPACE}" rollout restart deployment/carepulse
else
  [ -n "${ANSIBLE_INVENTORY}" ] || fail "ANSIBLE_INVENTORY nu este definit."
  apply_manifest_remote "${MANIFEST_FILE}"
  apply_manifest_remote "${CONFIGMAP_FILE}"
  apply_manifest_remote "${SECRET_FILE}"
  remote_kubectl_output "${ANSIBLE_INVENTORY}" "-n ${NAMESPACE} rollout restart deployment/carepulse" >/dev/null
fi

write_env_var "$(runtime_env_file)" DEPLOYED_OVERLAY "${DB_OVERLAY}"
write_env_var "$(runtime_env_file)" IMAGE_REF "${IMAGE_REF}"

log "Application deployed with overlay ${DB_OVERLAY}"
