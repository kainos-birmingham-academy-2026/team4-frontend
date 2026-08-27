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
