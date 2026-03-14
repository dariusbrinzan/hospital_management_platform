variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "environment_name" {
  type    = string
  default = "carepulse"
}

variable "vpc_cidr" {
  type    = string
  default = "10.70.0.0/16"
}

variable "public_subnet_cidr" {
  type    = string
  default = "10.70.0.0/24"
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.70.10.0/24", "10.70.11.0/24"]
}

variable "admin_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "key_name" {
  type = string
}

variable "bastion_instance_type" {
  type    = string
  default = "t3.small"
}

variable "control_plane_instance_type" {
  type    = string
  default = "t3.large"
}

variable "worker_instance_type" {
  type    = string
  default = "t3.large"
}

variable "worker_count" {
  type    = number
  default = 2
}

variable "common_tags" {
  type    = map(string)
  default = {}
}

