resource "azurerm_container_app" "this" {
  name                         = var.name
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [var.managed_identity_id]
  }

  registry {
    server   = var.registry_server
    identity = var.managed_identity_id
  }

  secret {
    name                = "session-secret-ref"
    key_vault_secret_id = var.session_secret_id
    identity            = var.managed_identity_id
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "frontend"
      image  = var.image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name        = "SESSION_SECRET"
        secret_name = "session-secret-ref"
      }

      env {
        name  = "API_BASE_URL"
        value = var.api_base_url
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "SESSION_COOKIE_SECURE"
        value = "true"
      }

      env {
        name  = "FEATURE_FLAGS_ENABLED"
        value = tostring(var.feature_flags_enabled)
      }

      liveness_probe {
        transport = "HTTP"
        port      = 3000
        path      = "/health"
      }

      readiness_probe {
        transport = "HTTP"
        port      = 3000
        path      = "/health"
      }
    }
  }

  tags = {
    Environment = var.environment
  }
}
