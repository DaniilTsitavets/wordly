locals {
  project       = "wordly"
  project_short = "wrd"

  environment = {
    name        = "development"
    short       = "dev"
    description = "Shared Wordly Resources"
  }

  prefix     = "${local.project}-${local.environment.short}"
  app_domain = "wordly.quest"

  tags = {
    Environment = local.environment.name
    IaC         = "Terragrunt"
    Project     = local.project
  }
}