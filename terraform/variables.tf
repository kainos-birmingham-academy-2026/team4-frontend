variable "resource_group_name" {
  description = "Name of the Azure resource group."
  type        = string
  default     = "team4-frontend-terraform"
}

variable "location" {
  description = "Azure region where the resource group is created."
  type        = string
  default     = "UK South"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be dev, test, or prod."
  }
}

variable "key_vault_name" {
  description = "Globally unique Key Vault name. Must be 3-24 characters and unique across Azure."
  type        = string
  default     = "kv-team4-frontend-dev"

  validation {
    condition     = can(regex("^[a-zA-Z][a-zA-Z0-9-]{1,22}[a-zA-Z0-9]$", var.key_vault_name))
    error_message = "Key Vault name must be 3-24 characters, start with a letter, and contain only letters, numbers, or hyphens."
  }
}

variable "managed_identity_name" {
  description = "Name of the user-assigned managed identity used by the Container App."
  type        = string
  default     = "id-team4-frontend-dev"
}

variable "acr_name" {
  description = "Name of the shared Azure Container Registry the Container App pulls from."
  type        = string
  default     = "acraiacademy26"
}

variable "acr_resource_group_name" {
  description = "Resource group that owns the shared Azure Container Registry."
  type        = string
  default     = "rg-ai-academy-26"
}
