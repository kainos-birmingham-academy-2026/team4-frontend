output "frontend_subnet_id" {
  description = "Resource ID of the frontend Container Apps subnet."
  value       = azurerm_subnet.frontend.id
}

output "backend_subnet_id" {
  description = "Resource ID of the backend Container Apps subnet."
  value       = azurerm_subnet.backend.id
}

output "virtual_network_id" {
  description = "Resource ID of the shared virtual network."
  value       = azurerm_virtual_network.this.id
}
