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
  path   = "${dirname(find_in_parent_folders("root.terragrunt.hcl"))}/_catalog/envcommon/data.hcl"
  expose = true
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
}