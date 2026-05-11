data "aws_region" "selected" {}

data "aws_availability_zones" "available" {}

data "aws_caller_identity" "current" {}

data "aws_ec2_managed_prefix_list" "cloudfront_prefix_list" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

data "aws_ami" "ecs_optimized_arm" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-ecs-hvm-*-arm64-*"]
  }
}

data "aws_secretsmanager_secret_version" "rds_master_password" {
  secret_id = "${var.secret_prefix}/${var.environment}/rds-master"
}