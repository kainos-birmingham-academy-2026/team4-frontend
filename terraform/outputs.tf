output "resource_group_name" {
  description = "Name of the Azure resource group."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "ID of the Azure resource group."
  value       = module.resource_group.id
}

output "resource_group_location" {
  description = "Azure region of the resource group."
  value       = var.location
}

output "key_vault_name" {
  description = "Name of the Key Vault holding application secrets."
  value       = module.key_vault.name
}

output "key_vault_id" {
  description = "Resource ID of the Azure Key Vault."
  value       = module.key_vault.id
}

output "key_vault_uri" {
  description = "Key Vault URI referenced by Container App secrets."
  value       = module.key_vault.uri
}
