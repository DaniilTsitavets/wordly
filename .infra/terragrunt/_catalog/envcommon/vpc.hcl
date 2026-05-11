# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/vpc/aws//.?version=6.0.1"
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
dependency "data" {
  config_path = "${get_terragrunt_dir()}/../data"

  mock_outputs = {
    available_aws_availability_zones_names = [
      "us-east-1a",
      "us-east-1b",
    ]
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name = "${local.prefix}-vpc"

  cidr = "10.0.0.0/16"

  azs = slice(dependency.data.outputs.available_aws_availability_zones_names, 0, 2)

  # All workloads (ECS tasks, ALB) run in public subnets — no NAT gateway needed
  public_subnets          = ["10.0.1.0/24", "10.0.2.0/24"]
  map_public_ip_on_launch = true

  # Separate subnet group required by RDS (still within VPC, no public exposure)
  create_database_subnet_group       = true
  create_database_subnet_route_table = true
  database_subnets                   = ["10.0.10.0/24", "10.0.11.0/24"]
  database_subnet_names              = ["${local.prefix}-db-a", "${local.prefix}-db-b"]

  enable_dhcp_options      = true
  dhcp_options_domain_name = "ec2.internal"
  create_igw               = true

  enable_nat_gateway = false
  enable_vpn_gateway = false

  manage_default_network_acl    = false
  manage_default_route_table    = false
  manage_default_security_group = false

  enable_flow_log = false

  enable_dns_hostnames = true
  enable_dns_support   = true
}