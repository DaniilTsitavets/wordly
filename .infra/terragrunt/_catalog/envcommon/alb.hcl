# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/alb/aws//.?version=10.4.0"
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
  config_path = "${get_terragrunt_dir()}/../vpc/"

  mock_outputs = {
    vpc_id          = "vpc-11111aa1a111c1a11"
    vpc_cidr_block  = "10.10.0.0/16"
    public_subnets  = [
      "subnet-1111a11aaa1aaa11a",
      "subnet-2222b22bbb2bbb22b",
    ]
  }
}

dependency "data" {
  config_path = "${get_terragrunt_dir()}/../data/"

  mock_outputs = {
    cloudfront_origin_prefix_list_id = "pl-1a111a11"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name    = "${local.prefix}-alb"
  vpc_id  = dependency.vpc.outputs.vpc_id
  subnets = dependency.vpc.outputs.public_subnets

  enable_deletion_protection       = false
  enable_cross_zone_load_balancing = true
  idle_timeout                     = 120

  create_security_group = true
  security_group_ingress_rules = {
    cloudfront_https = {
      from_port      = 8080
      to_port        = 8080
      ip_protocol    = "tcp"
      prefix_list_id = dependency.data.outputs.cloudfront_origin_prefix_list_id
    }
  }
  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }

  listeners = {
    "${local.prefix}-alb-listener" = {
      port     = 8080
      protocol = "HTTP"

      forward = {
        target_group_key = "${local.prefix}-alb-backend-tg"
      }
    }
  }

  target_groups = {
    "${local.prefix}-alb-backend-tg" = {
      protocol             = "HTTP"
      port                 = 8080
      target_type          = "instance"
      deregistration_delay = 5

      health_check = {
        enabled             = true
        healthy_threshold   = 2
        interval            = 30
        matcher             = "200"
        path                = "/api/v1/health"
        port                = 8080
        protocol            = "HTTP"
        timeout             = 10
        unhealthy_threshold = 3
      }

      create_attachment = false
    }
  }
}