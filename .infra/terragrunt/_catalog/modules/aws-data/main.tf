data "aws_region" "selected" {}

data "aws_availability_zones" "available" {}

data "aws_caller_identity" "current" {}

data "aws_ec2_managed_prefix_list" "cloudfront_prefix_list" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

data "aws_ssm_parameter" "ecs_optimized_arm_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2023/arm64/recommended/image_id"
}

data "aws_secretsmanager_secret" "ecs_backend" {
  name = "${var.secret_prefix}/${var.environment}/ecs-backend-env-vars"
}

data "aws_secretsmanager_secret_version" "ecs_backend" {
  secret_id = data.aws_secretsmanager_secret.ecs_backend.id
}