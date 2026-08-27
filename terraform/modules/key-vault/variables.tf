variable "name" {
  description = "Globally unique name for the Key Vault (3-24 letters, numbers, or hyphens)."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group that will own the Key Vault."
  type        = string
}

variable "location" {
  description = "Azure region for the Key Vault."
  type        = string
}

variable "environment" {
  description = "Deployment environment used for tags."
  type        = string
}

variable "tenant_id" {
  description = "Azure AD tenant that owns access to the Key Vault."
  type        = string
}
