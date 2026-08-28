variable "resource_group_name" {
  description = "Resource group for the shared application network."
  type        = string
}

variable "location" {
  description = "Azure region for the shared application network."
  type        = string
}

variable "name" {
  description = "Name of the shared virtual network."
  type        = string
}

variable "address_space" {
  description = "CIDR address space for the shared virtual network."
  type        = string
}

variable "frontend_subnet_name" {
  description = "Name of the frontend Container Apps subnet."
  type        = string
}

variable "frontend_subnet_address_prefix" {
  description = "CIDR address prefix for the frontend Container Apps subnet."
  type        = string
}

variable "backend_subnet_name" {
  description = "Name of the backend Container Apps subnet."
  type        = string
}

variable "backend_subnet_address_prefix" {
  description = "CIDR address prefix for the backend Container Apps subnet."
  type        = string
}

variable "environment" {
  description = "Deployment environment used for tags."
  type        = string
}
