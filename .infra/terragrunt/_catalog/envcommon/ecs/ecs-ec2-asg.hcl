# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/autoscaling/aws//.?version=9.2.1"
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env          = local.environment_vars.locals.environment.short
  prefix       = "${local.environment_vars.locals.prefix}-${local.region_vars.locals.aws_region_short}"
  region       = local.region_vars.locals.aws_region
  cluster_name = "${local.prefix}-ecs-cluster"
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------
dependency "vpc" {
  config_path = "${get_terragrunt_dir()}/../../vpc/"

  mock_outputs = {
    public_subnets            = ["subnet-1111a11aaa1aaa11a", "subnet-2222b22bbb2bbb22b"]
    default_security_group_id = "sg-00000000000000000"
  }
}

dependency "data" {
  config_path = "${get_terragrunt_dir()}/../../data/"

  mock_outputs = {
    ecs_optimized_arm_ami_id = "ami-0123456789abcdef0"
  }
}

dependency "asg-sg" {
  config_path = "${get_terragrunt_dir()}/../asg-sg/"

  mock_outputs = {
    security_group_id = "sg-0000000"
  }
}


# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name = "${local.prefix}-ecs-asg"

  image_id      = dependency.data.outputs.ecs_optimized_arm_ami_id
  instance_type = "t4g.small"

  min_size         = 1
  max_size         = 2
  desired_capacity = 1

  vpc_zone_identifier = dependency.vpc.outputs.public_subnets

  # IAM instance profile — grants ECS agent permissions
  create_iam_instance_profile = true
  iam_role_name               = "${local.prefix}-ecs-instance"
  iam_role_policies = {
    AmazonEC2ContainerServiceforEC2Role = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
    AmazonSSMManagedInstanceCore        = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
  }

  # Connects EC2 instance to the ECS cluster on boot
  user_data = base64encode(<<-EOT
    #!/bin/bash
    echo ECS_CLUSTER=${local.cluster_name} >> /etc/ecs/ecs.config
  EOT
  )

  network_interfaces = [
  {
    associate_public_ip_address = true
    delete_on_termination       = true
    security_groups             = [dependency.asg-sg.outputs.security_group_id]
  }
]

  tags = {
    AmazonECSManaged = "true"
  }
}