variable "name" {
  description = "Name of the Container Apps environment."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group that will own the environment."
  type        = string
}

variable "location" {
  description = "Azure region for the environment."
  type        = string
}

variable "environment" {
  description = "Deployment environment used for tags."
  type        = string
}
