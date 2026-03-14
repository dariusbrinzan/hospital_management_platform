variable "location" {
  type    = string
  default = "westeurope"
}

variable "resource_group_name" {
  type    = string
  default = "carepulse-rg"
}

variable "cluster_name" {
  type    = string
  default = "carepulse-aks"
}

variable "kubernetes_version" {
  type    = string
  default = "1.30.0"
}

variable "dns_prefix" {
  type    = string
  default = "carepulse"
}

variable "node_count" {
  type    = number
  default = 2
}

variable "vm_size" {
  type    = string
  default = "Standard_D4s_v5"
}

variable "vnet_cidr" {
  type    = list(string)
  default = ["10.90.0.0/16"]
}

variable "aks_subnet_cidr" {
  type    = list(string)
  default = ["10.90.10.0/24"]
}

variable "common_tags" {
  type    = map(string)
  default = {}
}

