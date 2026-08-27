terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Created by ./bootstrap, which keeps its own local state.
  backend "azurerm" {
    resource_group_name  = "team4-frontend-terraform-state"
    storage_account_name = "team4frontendtfstate"
    container_name       = "tfstate"
    key                  = "team4-frontend.tfstate"
    use_azuread_auth     = true
  }
}

provider "azurerm" {
  features {
    key_vault {
      # Dev-friendly: destroy can purge a soft-deleted vault so the name can be reused.
      purge_soft_delete_on_destroy    = true
      recover_soft_deleted_key_vaults = true
    }
  }
}

# Tenant of the identity running Terraform (you locally, the OIDC app in CI).
data "azurerm_client_config" "current" {}

module "resource_group" {
  source = "./modules/resource-group"

  name        = var.resource_group_name
  location    = var.location
  environment = var.environment
}

# Preserves the RG created before it was moved into the module.
moved {
  from = azurerm_resource_group.this
  to   = module.resource_group.azurerm_resource_group.this
}

# Secrets are added manually in the portal, never in code.
module "key_vault" {
  source = "./modules/key-vault"

  name                = var.key_vault_name
  resource_group_name = module.resource_group.name
  location            = var.location
  environment         = var.environment
  tenant_id           = data.azurerm_client_config.current.tenant_id
}

# Identity the Container App will use to read Key Vault secrets and pull from ACR.
module "managed_identity" {
  source = "./modules/managed-identity"

  name                = var.managed_identity_name
  resource_group_name = module.resource_group.name
  location            = var.location
  environment         = var.environment
}

# The shared academy registry lives in rg-ai-academy-26, which the CI identity cannot
# read. Its AcrPull assignment for this identity is managed manually, outside Terraform.

resource "azurerm_role_assignment" "identity_key_vault_secrets" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = module.managed_identity.principal_id
}

module "container_app_environment" {
  source = "./modules/container-app-environment"

  name                = var.container_app_environment_name
  resource_group_name = module.resource_group.name
  location            = var.location
  environment         = var.environment
}

