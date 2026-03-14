variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "environment_name" {
  type    = string
  default = "carepulse"
}

variable "kubernetes_version" {
  type    = string
  default = "1.30"
}

variable "vpc_cidr" {
  type    = string
  default = "10.80.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.80.0.0/24", "10.80.1.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.80.10.0/24", "10.80.11.0/24"]
}

variable "admin_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "node_instance_types" {
  type    = list(string)
  default = ["t3.large"]
}

variable "node_desired_size" {
  type    = number
  default = 2
}

variable "node_min_size" {
  type    = number
  default = 2
}

variable "node_max_size" {
  type    = number
  default = 4
}

variable "node_disk_size" {
  type    = number
  default = 80
}

variable "key_name" {
  type    = string
  default = null
}

variable "common_tags" {
  type    = map(string)
  default = {}
}

