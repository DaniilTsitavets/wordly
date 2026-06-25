# ----------------------------------------------------------------------------------------------------------------------
# Find terragrunt.hcl config file
# ----------------------------------------------------------------------------------------------------------------------
include "root" {
  path = find_in_parent_folders("root.terragrunt.hcl")
}

# ----------------------------------------------------------------------------------------------------------------------
# Include _envcommon config file for the correspondent module
# ----------------------------------------------------------------------------------------------------------------------
include "envcommon" {
  path   = "${dirname(find_in_parent_folders("root.terragrunt.hcl"))}/_catalog/envcommon/acm.hcl"
  expose = true
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env    = local.environment_vars.locals.environment.short
  prefix = local.environment_vars.locals.prefix
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------
dependency "route53" {
  config_path = "../../route53/${local.environment_vars.locals.app_domain}"

  mock_outputs = {
    id   = "Z0000000000ABC"
    name = "example.com"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables - override if needed
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  zone_id = dependency.route53.outputs.id
}
