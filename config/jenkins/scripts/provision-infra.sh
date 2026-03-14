#!/usr/bin/env bash
set -euo pipefail

. "$(cd "$(dirname "$0")" && pwd)/common.sh"

ensure_runtime_defaults
TARGET_PLATFORM="${TARGET_PLATFORM:-onprem}"
PROVISIONER="${PROVISIONER:-none}"
AWS_REGION="${AWS_REGION:-eu-central-1}"
AZURE_LOCATION="${AZURE_LOCATION:-westeurope}"
ADMIN_CIDR="${ADMIN_CIDR:-0.0.0.0/0}"
KEY_NAME="${KEY_NAME:-}"
CF_STACK_PREFIX="${CF_STACK_PREFIX:-carepulse}"

INFRA_ENV="$(infra_env_file)"
: > "${INFRA_ENV}"

provision_aws_ec2_terraform() {
  require_cmd terraform
  require_cmd jq

  local tf_dir="${CONFIG_ROOT}/terraform/aws-ec2"
  local output_json="${GENERATED_DIR}/aws-ec2-terraform-output.json"
  local args=(
    "-var=aws_region=${AWS_REGION}"
    "-var=environment_name=${ENVIRONMENT}"
    "-var=admin_cidr=${ADMIN_CIDR}"
  )

  if [ -n "${KEY_NAME}" ]; then
    args+=("-var=key_name=${KEY_NAME}")
  else
    fail "KEY_NAME este obligatoriu pentru aws-ec2 cu Terraform."
  fi

  terraform -chdir="${tf_dir}" init -input=false
  terraform -chdir="${tf_dir}" apply -input=false -auto-approve "${args[@]}"
  terraform -chdir="${tf_dir}" output -json > "${output_json}"

  write_env_var "${INFRA_ENV}" PROVISIONER terraform
  write_env_var "${INFRA_ENV}" TARGET_PLATFORM aws-ec2
  write_env_var "${INFRA_ENV}" AWS_REGION "${AWS_REGION}"
  write_env_var "${INFRA_ENV}" BASTION_PUBLIC_IP "$(jq -r '.bastion_public_ip.value' "${output_json}")"
  write_env_var "${INFRA_ENV}" CONTROL_PLANE_PRIVATE_IP "$(jq -r '.control_plane_private_ip.value' "${output_json}")"
  write_env_var "${INFRA_ENV}" WORKER_PRIVATE_IPS "$(jq -r '.worker_private_ips.value | join(",")' "${output_json}")"
}

provision_aws_ec2_cloudformation() {
  require_cmd aws
  require_cmd jq

  [ -n "${KEY_NAME}" ] || fail "KEY_NAME este obligatoriu pentru aws-ec2 cu CloudFormation."

  local stack_name="${CF_STACK_PREFIX}-${ENVIRONMENT}-ec2-k8s"
  local output_json="${GENERATED_DIR}/aws-ec2-cloudformation-output.json"

  aws cloudformation deploy \
    --region "${AWS_REGION}" \
    --template-file "${CONFIG_ROOT}/cloudformation/aws/ec2-self-managed-k8s.yaml" \
    --stack-name "${stack_name}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
      EnvironmentName="${ENVIRONMENT}" \
      KeyName="${KEY_NAME}" \
      AdminCidr="${ADMIN_CIDR}"

  aws cloudformation describe-stacks \
    --region "${AWS_REGION}" \
    --stack-name "${stack_name}" \
    --query 'Stacks[0].Outputs' \
    --output json > "${output_json}"

  write_env_var "${INFRA_ENV}" PROVISIONER cloudformation
  write_env_var "${INFRA_ENV}" TARGET_PLATFORM aws-ec2
  write_env_var "${INFRA_ENV}" AWS_REGION "${AWS_REGION}"
  write_env_var "${INFRA_ENV}" CLOUDFORMATION_STACK_NAME "${stack_name}"
  write_env_var "${INFRA_ENV}" BASTION_PUBLIC_IP "$(jq -r '.[] | select(.OutputKey=="BastionPublicIp") | .OutputValue' "${output_json}")"
  write_env_var "${INFRA_ENV}" CONTROL_PLANE_PRIVATE_IP "$(jq -r '.[] | select(.OutputKey=="ControlPlanePrivateIp") | .OutputValue' "${output_json}")"
  write_env_var "${INFRA_ENV}" WORKER_PRIVATE_IPS "$(jq -r '[.[] | select(.OutputKey=="Worker1PrivateIp" or .OutputKey=="Worker2PrivateIp") | .OutputValue] | join(",")' "${output_json}")"
}

provision_aws_eks_terraform() {
  require_cmd terraform
  require_cmd jq

  local tf_dir="${CONFIG_ROOT}/terraform/aws-eks"
  local output_json="${GENERATED_DIR}/aws-eks-terraform-output.json"
  local args=(
    "-var=aws_region=${AWS_REGION}"
    "-var=environment_name=${ENVIRONMENT}"
    "-var=admin_cidr=${ADMIN_CIDR}"
  )

  if [ -n "${KEY_NAME}" ]; then
    args+=("-var=key_name=${KEY_NAME}")
  fi

  terraform -chdir="${tf_dir}" init -input=false
  terraform -chdir="${tf_dir}" apply -input=false -auto-approve "${args[@]}"
  terraform -chdir="${tf_dir}" output -json > "${output_json}"

  write_env_var "${INFRA_ENV}" PROVISIONER terraform
  write_env_var "${INFRA_ENV}" TARGET_PLATFORM aws-eks
  write_env_var "${INFRA_ENV}" AWS_REGION "${AWS_REGION}"
  write_env_var "${INFRA_ENV}" EKS_CLUSTER_NAME "$(jq -r '.cluster_name.value' "${output_json}")"
}

provision_aws_eks_cloudformation() {
  require_cmd aws
  require_cmd jq

  [ -n "${KEY_NAME}" ] || fail "KEY_NAME este obligatoriu pentru aws-eks cu CloudFormation."

  local stack_name="${CF_STACK_PREFIX}-${ENVIRONMENT}-eks"
  local output_json="${GENERATED_DIR}/aws-eks-cloudformation-output.json"

  aws cloudformation deploy \
    --region "${AWS_REGION}" \
    --template-file "${CONFIG_ROOT}/cloudformation/aws/eks-cluster.yaml" \
    --stack-name "${stack_name}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides \
      EnvironmentName="${ENVIRONMENT}" \
      NodeKeyName="${KEY_NAME}" \
      AdminCidr="${ADMIN_CIDR}"

  aws cloudformation describe-stacks \
    --region "${AWS_REGION}" \
    --stack-name "${stack_name}" \
    --query 'Stacks[0].Outputs' \
    --output json > "${output_json}"

  write_env_var "${INFRA_ENV}" PROVISIONER cloudformation
  write_env_var "${INFRA_ENV}" TARGET_PLATFORM aws-eks
  write_env_var "${INFRA_ENV}" AWS_REGION "${AWS_REGION}"
  write_env_var "${INFRA_ENV}" CLOUDFORMATION_STACK_NAME "${stack_name}"
  write_env_var "${INFRA_ENV}" EKS_CLUSTER_NAME "$(jq -r '.[] | select(.OutputKey=="ClusterName") | .OutputValue' "${output_json}")"
}

provision_azure_aks_terraform() {
  require_cmd terraform
  require_cmd jq

  local tf_dir="${CONFIG_ROOT}/terraform/azure-aks"
  local output_json="${GENERATED_DIR}/azure-aks-terraform-output.json"

  terraform -chdir="${tf_dir}" init -input=false
  terraform -chdir="${tf_dir}" apply -input=false -auto-approve \
    -var="location=${AZURE_LOCATION}" \
    -var="resource_group_name=${ENVIRONMENT}-rg" \
    -var="cluster_name=${ENVIRONMENT}-aks"
  terraform -chdir="${tf_dir}" output -json > "${output_json}"

  write_env_var "${INFRA_ENV}" PROVISIONER terraform
  write_env_var "${INFRA_ENV}" TARGET_PLATFORM azure-aks
  write_env_var "${INFRA_ENV}" AZURE_LOCATION "${AZURE_LOCATION}"
  write_env_var "${INFRA_ENV}" AKS_RESOURCE_GROUP "$(jq -r '.resource_group_name.value' "${output_json}")"
  write_env_var "${INFRA_ENV}" AKS_CLUSTER_NAME "$(jq -r '.cluster_name.value' "${output_json}")"
}

case "${TARGET_PLATFORM}" in
  onprem)
    log "Skipping infrastructure provisioning for on-prem target."
    write_env_var "${INFRA_ENV}" TARGET_PLATFORM onprem
    write_env_var "${INFRA_ENV}" PROVISIONER none
    ;;
  aws-ec2)
    case "${PROVISIONER}" in
      terraform) provision_aws_ec2_terraform ;;
      cloudformation) provision_aws_ec2_cloudformation ;;
      *) fail "Provisioner nesuportat pentru aws-ec2: ${PROVISIONER}" ;;
    esac
    ;;
  aws-eks)
    case "${PROVISIONER}" in
      terraform) provision_aws_eks_terraform ;;
      cloudformation) provision_aws_eks_cloudformation ;;
      *) fail "Provisioner nesuportat pentru aws-eks: ${PROVISIONER}" ;;
    esac
    ;;
  azure-aks)
    [ "${PROVISIONER}" = "terraform" ] || fail "Pentru azure-aks este suportat doar terraform."
    provision_azure_aks_terraform
    ;;
  *)
    fail "TARGET_PLATFORM necunoscut: ${TARGET_PLATFORM}"
    ;;
esac

log "Infrastructure metadata written to ${INFRA_ENV}"

