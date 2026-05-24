# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/acm/aws//.?version=6.1.0"
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env    = local.environment_vars.locals.environment.short
  prefix = local.environment_vars.locals.prefix
  region = local.region_vars.locals.aws_region
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------
# NOTE: dependency "route53" must be declared in the leaf terragrunt.hcl — dependency blocks
# in exposed includes are evaluated before dependency outputs are resolved, causing "Unknown variable" errors.

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  domain_name = "${basename(get_terragrunt_dir())}"
  # zone_id is injected by the leaf terragrunt.hcl via dependency.route53.outputs.id
  subject_alternative_names = [
    "*.${basename(get_terragrunt_dir())}"
  ]

  validate_certificate = true
  wait_for_validation  = true

  create_route53_records             = true
  validation_method                  = "DNS"
  validation_allow_overwrite_records = false
  dns_ttl                            = 300
}
