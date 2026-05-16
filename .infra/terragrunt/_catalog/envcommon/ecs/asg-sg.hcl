# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/security-group/aws//.?version=5.3.1"
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env    = local.environment_vars.locals.environment.short
  prefix = "${local.environment_vars.locals.prefix}-${local.region_vars.locals.aws_region_short}"
  region = local.region_vars.locals.aws_region
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------
dependency "vpc" {
  config_path = "${get_terragrunt_dir()}/../../vpc/"

  mock_outputs = {
    vpc_id = "vpc-11111aa1a111c1a11"
  }
}

dependency "alb" {
  config_path = "${get_terragrunt_dir()}/../../alb/"

  mock_outputs = {
    security_group_id = "sg-0000000"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name   = "${local.prefix}-ecs-asg-sg"
  vpc_id = dependency.vpc.outputs.vpc_id
  egress_with_cidr_blocks = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = -1
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}