# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/ecs/aws//modules/service/.?version=7.5.0"
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env    = local.environment_vars.locals.environment.short
  prefix = "${local.environment_vars.locals.prefix}-${local.region_vars.locals.aws_region_short}"
  region = local.region_vars.locals.aws_region

  backend_settings = local.environment_vars.locals.workload_settings.backend
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------
dependency "alb" {
  config_path = "${get_terragrunt_dir()}/../../alb/"

  mock_outputs = {
    target_groups = {
      "mock-alb-backend-tg" = {
        arn = "arn:aws:elasticloadbalancing:us-east-1:111111111111:targetgroup/mock/b7f71f4693afc450"
      }
    }
    security_group_id = "sg-091b7200098411270"
  }
}

dependency "cluster" {
  config_path = "${get_terragrunt_dir()}/../cluster/"

  mock_outputs = {
    arn  = "arn:aws:ecs:us-east-1:111111111111:cluster/mock-cluster"
    name = "mock-cluster"
  }
}

dependency "vpc" {
  config_path = "${get_terragrunt_dir()}/../../vpc/"

  mock_outputs = {
    vpc_id = "vpc-11111aa1a111c1a11"
    public_subnets = ["subnet-1111a11aaa1aaa11a", "subnet-2222b22bbb2bbb22b"]
  }
}

dependency "secrets" {
  config_path = "${get_terragrunt_dir()}/../../secrets/ecs-backend/"

  mock_outputs = {
    secret_arn = "arn:aws:secretsmanager:us-east-1:111111111111:secret:wordly/dev/ecs-backend-env-vars-aaaaaa"
  }
}

dependency "ecr" {
  config_path = "${get_terragrunt_dir()}/../../../../_shared/us-east-1/ecr/wordly-app/"

  mock_outputs = {
    repository_url = "111111111111.dkr.ecr.us-east-1.amazonaws.com/backend"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name        = "${local.prefix}-ecs-backend"
  cluster_arn = dependency.cluster.outputs.arn

  capacity_provider_strategy = {
    ec2 = {
      capacity_provider = "${local.prefix}-ec2-cp"
      weight            = 1
      base              = 1
    }
  }

  requires_compatibilities           = ["EC2"]
  enable_autoscaling                 = false
  deployment_minimum_healthy_percent = 50
  health_check_grace_period_seconds  = 60

  cpu    = 512
  memory = 896

  runtime_platform = {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  enable_execute_command = true

  task_exec_secret_arns = [
    dependency.secrets.outputs.secret_arn
  ]

  tasks_iam_role_path = "/"

  container_definitions = {
    backend = {
      cpu       = 512
      memory    = 896
      essential = true
      image     = "${dependency.ecr.outputs.repository_url}:${get_env("IMAGE_TAG", "latest")}"

      # camelCase — именно так ожидает модуль
      portMappings = [
        {
          name          = "backend-http"
          containerPort = 8080
          hostPort      = 8080
          protocol      = "tcp"
        }
      ]

      readonly_root_filesystem  = false
      enable_cloudwatch_logging = true

      environment = local.backend_settings.env_vars
      secrets = [
        for secret_name in local.backend_settings.secrets : {
          name      = secret_name
          valueFrom = "${dependency.secrets.outputs.secret_arn}:${secret_name}::"
        }
      ]
    }
  }

  load_balancer = {
    service = {
      target_group_arn = dependency.alb.outputs.target_groups["${local.prefix}-alb-backend-tg"].arn
      container_name   = "backend"
      container_port   = 8080
    }
  }

  subnet_ids = dependency.vpc.outputs.public_subnets

  security_group_ingress_rules = {
    alb = {
      description                  = "Traffic from ALB"
      from_port                    = 8080
      to_port                      = 8080
      ip_protocol                  = "tcp"
      referenced_security_group_id = dependency.alb.outputs.security_group_id
    }
  }
  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }
}