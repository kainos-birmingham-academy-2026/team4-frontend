# The shared platform that Container Apps run on. Create this before the app itself.
resource "azurerm_container_app_environment" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name

  infrastructure_subnet_id = var.infrastructure_subnet_id

  tags = {
    Environment = var.environment
  }
}
