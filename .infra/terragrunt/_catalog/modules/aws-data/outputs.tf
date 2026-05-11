output "aws_region" {
  value = data.aws_region.selected
}

output "available_aws_availability_zones_names" {
  value = data.aws_availability_zones.available.names
}

output "available_aws_availability_zones_zone_ids" {
  value = data.aws_availability_zones.available.zone_ids
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "cloudfront_origin_prefix_list_id" {
  description = "AWS managed prefix list ID for CloudFront origin-facing traffic"
  value       = data.aws_ec2_managed_prefix_list.cloudfront_prefix_list.id
}

output "ecs_optimized_arm_ami_id" {
  description = "Latest ECS-optimized Amazon Linux 2023 AMI ID for ARM (t4g instances)"
  value       = data.aws_ami.ecs_optimized_arm.id
}

output "rds_master_password" {
  description = "RDS master password from Secrets Manager"
  value       = data.aws_secretsmanager_secret_version.rds_master_password.secret_string
  sensitive   = true
}