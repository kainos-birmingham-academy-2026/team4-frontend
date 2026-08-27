terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

# shared_access_key_enabled = false below means data-plane calls must use Entra ID.
provider "azurerm" {
  features {}

  storage_use_azuread = true
}

resource "azurerm_resource_group" "state" {
  name     = "team4-frontend-terraform-state"
  location = "UK South"
}

resource "azurerm_storage_account" "state" {
  name                            = "team4frontendtfstate"
  resource_group_name             = azurerm_resource_group.state.name
  location                        = azurerm_resource_group.state.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS"
  min_tls_version                 = "TLS1_2"
  https_traffic_only_enabled      = true
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = false

  blob_properties {
    versioning_enabled = true

    delete_retention_policy {
      days = 30
    }
  }

  # State is the source of truth for every other resource; never let a destroy remove it.
  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_storage_container" "state" {
  name                  = "tfstate"
  storage_account_id    = azurerm_storage_account.state.id
  container_access_type = "private"
}
