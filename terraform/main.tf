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
  features {}
}

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

