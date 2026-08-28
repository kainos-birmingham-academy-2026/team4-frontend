output "id" {
  description = "Resource ID of the Container App."
  value       = azurerm_container_app.this.id
}

output "name" {
  description = "Name of the Container App."
  value       = azurerm_container_app.this.name
}

output "fqdn" {
  description = "Public FQDN of the Container App."
  value       = azurerm_container_app.this.ingress[0].fqdn
}
