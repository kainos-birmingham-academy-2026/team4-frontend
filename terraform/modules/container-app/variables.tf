variable "name" {
  description = "Name of the Container App."
  type        = string
}

variable "resource_group_name" {
  description = "Resource group that will own the Container App."
  type        = string
}

variable "container_app_environment_id" {
  description = "Resource ID of the Container Apps environment."
  type        = string
}

variable "managed_identity_id" {
  description = "Resource ID of the user-assigned managed identity."
  type        = string
}

variable "registry_server" {
  description = "Login server of the Azure Container Registry."
  type        = string
}

variable "image" {
  description = "Fully qualified container image including tag."
  type        = string
}

variable "session_secret_id" {
  description = "Versionless Key Vault secret ID for SESSION_SECRET."
  type        = string
}

variable "api_base_url" {
  description = "Base URL used by the frontend to call the backend API."
  type        = string
}

variable "feature_flags_enabled" {
  description = "Deployment-level feature flag for the frontend."
  type        = bool
  default     = false
}

variable "environment" {
  description = "Deployment environment used for tags."
  type        = string
}
