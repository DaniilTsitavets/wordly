# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/rds/aws//.?version=6.13.1"
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
dependency "sg" {
  config_path = "${get_terragrunt_dir()}/../sg/"

  mock_outputs = {
    security_group_id = "sg-0000000"
  }
}

dependency "vpc" {
  config_path = "${get_terragrunt_dir()}/../../vpc/"

  mock_outputs = {
    database_subnet_group_name = "mock-db-subnet-group"
  }
}

dependency "data" {
  config_path = "${get_terragrunt_dir()}/../../data/"

  mock_outputs = {
    spring_datasource_password = "mock_password_for_plan"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  identifier = "${local.prefix}-rds"

  manage_master_user_password = false
  password                    = dependency.data.outputs.spring_datasource_password

  engine                   = "postgres"
  engine_version           = "17.4"
  engine_lifecycle_support = "open-source-rds-extended-support-disabled"
  family                   = "postgres17"
  major_engine_version     = "17"

  instance_class    = "db.t4g.small"
  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = "wordly"
  username = "postgres"

  multi_az               = false
  db_subnet_group_name   = dependency.vpc.outputs.database_subnet_group_name
  vpc_security_group_ids = [dependency.sg.outputs.security_group_id]

  maintenance_window      = "Mon:00:00-Mon:03:00"
  backup_window           = "03:00-06:00"
  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false
  storage_encrypted       = true

  apply_immediately = true

  performance_insights_enabled    = false
  create_monitoring_role          = false
  monitoring_interval             = 0
  enabled_cloudwatch_logs_exports = ["postgresql"]

  create_db_parameter_group = true
  parameters                = []
}