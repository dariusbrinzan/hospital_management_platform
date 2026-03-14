#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

require_cmd docker
ensure_runtime_defaults
ensure_default_image_tag

IMAGE_REPOSITORY="${IMAGE_REPOSITORY:-ghcr.io/example/carepulse}"
IMAGE_REF="${IMAGE_REPOSITORY}:${IMAGE_TAG}"
PUSH_IMAGE="${PUSH_IMAGE:-false}"

log "Building Docker image ${IMAGE_REF}"

docker build \
  -f "${CONFIG_ROOT}/docker/Dockerfile" \
  --build-arg NEXT_PUBLIC_APP_URL="${APP_PUBLIC_URL}" \
  --build-arg NEXT_PUBLIC_ADMIN_PASSKEY="${NEXT_PUBLIC_ADMIN_PASSKEY:-111111}" \
  --build-arg SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN:-}" \
  -t "${IMAGE_REF}" \
  "${REPO_ROOT}"

if [ "${PUSH_IMAGE}" = "true" ]; then
  if [ -n "${REGISTRY_USERNAME:-}" ] && [ -n "${REGISTRY_PASSWORD:-}" ]; then
    local_registry="${IMAGE_REPOSITORY%%/*}"
    log "Logging into registry ${local_registry}"
    printf '%s' "${REGISTRY_PASSWORD}" | docker login "${local_registry}" --username "${REGISTRY_USERNAME}" --password-stdin
  fi
  log "Pushing Docker image ${IMAGE_REF}"
  docker push "${IMAGE_REF}"
fi

IMAGE_ENV_FILE="$(image_env_file)"
: > "${IMAGE_ENV_FILE}"
write_env_var "${IMAGE_ENV_FILE}" IMAGE_REPOSITORY "${IMAGE_REPOSITORY}"
write_env_var "${IMAGE_ENV_FILE}" IMAGE_TAG "${IMAGE_TAG}"
write_env_var "${IMAGE_ENV_FILE}" IMAGE_REF "${IMAGE_REF}"

log "Image metadata written to ${IMAGE_ENV_FILE}"

