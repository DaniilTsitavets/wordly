include "root" {
  path = find_in_parent_folders("root.terragrunt.hcl")
}

include "envcommon" {
  path   = "${dirname(find_in_parent_folders("root.terragrunt.hcl"))}/_catalog/envcommon/ecs/ecs-backend-task-service.hcl"
  expose = true
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables - override if needed
# ----------------------------------------------------------------------------------------------------------------------
# inputs = {
# }
