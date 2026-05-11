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
        # Secret keys injected from Secrets Manager (ecs-backend-env-vars)
        # e.g. "JWT_SECRET", "DB_PASSWORD"
      ]
      env_vars = [
        {
          name  = "SPRING_PROFILES_ACTIVE"
          value = "dev"
        },
        {
          name  = "SERVER_PORT"
          value = "8080"
        }
      ]
    }
  }
}