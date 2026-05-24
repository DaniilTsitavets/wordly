# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "${dirname(find_in_parent_folders("root.terragrunt.hcl"))}/_catalog/modules//secrets-manager"
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env    = local.environment_vars.locals.environment.short
  prefix = local.environment_vars.locals.prefix
  region = local.region_vars.locals.aws_region
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------


# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  secret_name             = "${local.environment_vars.locals.project}/${local.env}/${basename(get_terragrunt_dir())}-env-vars"
  secret_description      = "Environment variables for ${local.environment_vars.locals.project} in ${local.env} environment in ${local.region} region"
  recovery_window_in_days = 7
}