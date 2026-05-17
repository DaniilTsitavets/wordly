# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/ecs/aws//modules/cluster?version=7.5.0"
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env    = local.environment_vars.locals.environment.short
  prefix = "${local.environment_vars.locals.prefix}-${local.region_vars.locals.aws_region_short}"
  region = local.region_vars.locals.aws_region
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name                        = "${local.prefix}-ecs-cluster"
  create_cloudwatch_log_group = false

  cluster_capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy = {
    FARGATE_SPOT = {
      weight = 1
      base   = 1
    }
  }

  setting = [
    {
      name  = "containerInsights"
      value = "disabled"
    }
  ]
}