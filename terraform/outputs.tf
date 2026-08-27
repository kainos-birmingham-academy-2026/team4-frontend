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
