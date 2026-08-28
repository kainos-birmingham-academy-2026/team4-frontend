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

variable "network_resource_group_name" {
  description = "Resource group for the shared frontend and backend network."
  type        = string
  default     = "team4-shared-network-dev"
}

variable "network_name" {
  description = "Name of the shared virtual network."
  type        = string
  default     = "vnet-team4-dev"
}

variable "network_address_space" {
  description = "CIDR address space for the shared virtual network."
  type        = string
  default     = "10.20.0.0/16"
}

variable "frontend_subnet_name" {
  description = "Delegated subnet for the frontend Container Apps Environment."
  type        = string
  default     = "snet-frontend-aca-dev"
}

variable "frontend_subnet_address_prefix" {
  description = "CIDR prefix for the frontend Container Apps subnet."
  type        = string
  default     = "10.20.0.0/23"
}

variable "backend_subnet_name" {
  description = "Delegated subnet for the backend Container Apps Environment."
  type        = string
  default     = "snet-backend-aca-dev"
}

variable "backend_subnet_address_prefix" {
  description = "CIDR prefix for the backend Container Apps subnet."
  type        = string
  default     = "10.20.2.0/23"
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

variable "container_app_environment_name" {
  description = "Name of the Container Apps environment."
  type        = string
  default     = "cae-team4-frontend-dev"
}

variable "shared_container_app_environment_name" {
  description = "Existing Container Apps environment shared with the backend."
  type        = string
  default     = "cae-team4-backend-dev"
}

variable "shared_container_app_environment_resource_group_name" {
  description = "Resource group containing the shared Container Apps environment."
  type        = string
  default     = "team4-backend-terraform"
}

variable "container_app_name" {
  description = "Name of the frontend Container App."
  type        = string
  default     = "ca-team4-frontend-dev"
}

variable "frontend_image_name" {
  description = "Repository name of the frontend image in ACR."
  type        = string
  default     = "team4-frontend"
}

variable "frontend_image_tag" {
  description = "Immutable tag of the frontend image to deploy."
  type        = string
  default     = "latest"
}

variable "session_secret_name" {
  description = "Key Vault secret name containing the frontend session secret."
  type        = string
  default     = "session-secret"
}

variable "api_base_url" {
  description = "Backend URL used by the frontend Container App."
  type        = string
  default     = "http://ca-team4-backend-dev"

  validation {
    condition     = length(trimspace(var.api_base_url)) > 0
    error_message = "api_base_url must be configured for the deployed frontend."
  }
}

variable "feature_flags_enabled" {
  description = "Enables frontend feature flags at deployment time."
  type        = bool
  default     = false
}
