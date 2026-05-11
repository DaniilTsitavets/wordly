# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/route53/aws//.?version=6.1.0"
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
dependency "cloudfront" {
  config_path = "${get_terragrunt_dir()}/../cloudfront"
  mock_outputs = {
    cloudfront_distribution_hosted_zone_id = "AAAAAAAAAA"
    cloudfront_distribution_domain_name    = "0000.cloudfront.net"
  }
}

dependency "route53" {
  config_path = "${get_terragrunt_dir()}/../../route53/${local.environment_vars.locals.app_domain}"

  mock_outputs = {
    id   = "Z0000000000ABC"
    name = "example.com"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  create_zone = false
  name        = dependency.route53.outputs.name
  zone_id     = dependency.route53.outputs.id

  records = {
    frontend = {
      name = "${local.env}"
      type = "A"
      alias = {
        name    = dependency.cloudfront.outputs.cloudfront_distribution_domain_name
        zone_id = dependency.cloudfront.outputs.cloudfront_distribution_hosted_zone_id
      }
    }
  }
}