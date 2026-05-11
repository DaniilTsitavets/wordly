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
  path   = "${dirname(find_in_parent_folders("root.terragrunt.hcl"))}/_catalog/envcommon/vpc.hcl"
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
# Module Input Variables - override the default values from _envcommon directory
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  cidr           = "10.10.0.0/16"
  public_subnets = ["10.10.1.0/24", "10.10.2.0/24"]
  database_subnets = ["10.10.10.0/24", "10.10.11.0/24"]
}