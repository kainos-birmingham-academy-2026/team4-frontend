output "id" {
  description = "Resource ID of the managed identity. Attach this to the Container App later."
  value       = azurerm_user_assigned_identity.this.id
}

output "name" {
  description = "Name of the managed identity."
  value       = azurerm_user_assigned_identity.this.name
}

output "client_id" {
  description = "Client ID used when the Container App authenticates as this identity."
  value       = azurerm_user_assigned_identity.this.client_id
}

output "principal_id" {
  description = "Object ID used for Key Vault and ACR role assignments."
  value       = azurerm_user_assigned_identity.this.principal_id
}
