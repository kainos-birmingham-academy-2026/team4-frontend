output "id" {
  description = "Resource ID of the Container Apps environment."
  value       = azurerm_container_app_environment.this.id
}

output "name" {
  description = "Name of the Container Apps environment."
  value       = azurerm_container_app_environment.this.name
}

output "default_domain" {
  description = "Default domain for apps in this environment."
  value       = azurerm_container_app_environment.this.default_domain
}
