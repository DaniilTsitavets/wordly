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
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------
dependency "asg" {
  config_path = "${get_terragrunt_dir()}/../asg/"

  mock_outputs = {
    autoscaling_group_arn = "arn:aws:autoscaling:us-east-1:111111111111:autoScalingGroup:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee:autoScalingGroupName/mock-asg"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name                        = "${local.prefix}-ecs-cluster"
  create_cloudwatch_log_group = false

  capacity_providers = {
    "${local.prefix}-ec2-cp" = {
      auto_scaling_group_provider = {
        auto_scaling_group_arn         = dependency.asg.outputs.autoscaling_group_arn
        managed_termination_protection = "DISABLED"
        managed_draining               = "ENABLED"

        managed_scaling = {
          maximum_scaling_step_size = 1
          minimum_scaling_step_size = 1
          status                    = "ENABLED"
          target_capacity           = 100
        }
      }
    }
  }

  default_capacity_provider_strategy = {
    "${local.prefix}-ec2-cp" = {
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