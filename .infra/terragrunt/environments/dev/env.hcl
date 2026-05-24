locals {
  project       = "wordly"
  project_short = "wrd"

  environment = {
    name        = "development"
    short       = "dev"
    description = "Development Wordly Environment"
  }

  prefix     = "${local.project}-${local.environment.short}"
  app_domain = "wordly.quest"

  tags = {
    Environment = local.environment.name
    IaC         = "Terragrunt"
    Project     = local.project
  }

  workload_settings = {
    backend = {
      secrets = [
        "DB_PASSWORD",
        "JWT_SECRET",
        "SPRING_PROFILES_ACTIVE",
        "DB_URL",
        "DB_USERNAME",
        "CORS_ALLOWED_ORIGINS",
        "OPENROUTER_API_KEY",
        "OPENROUTER_MODEL",
        "OPENROUTER_BASE_URL",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET"
      ]
      env_vars = [
        {
          name  = "SERVER_PORT"
          value = "8080"
        },
      ]
    }
  }
}