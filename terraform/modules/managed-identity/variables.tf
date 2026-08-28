variable "name" {
  description = "Name of the user-assigned managed identity."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group that will own the managed identity."
  type        = string
}

variable "location" {
  description = "Azure region for the managed identity."
  type        = string
}

variable "environment" {
  description = "Deployment environment used for tags."
  type        = string
}
