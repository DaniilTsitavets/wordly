# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/ecr/aws//.?version=3.1.0"
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

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  repository_name                 = basename(get_terragrunt_dir())
  repository_image_tag_mutability = "MUTABLE"

  create_lifecycle_policy       = true
  attach_repository_policy      = true
  create_repository_policy      = true
  repository_image_scan_on_push = true

  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        "rulePriority" : 1,
        "description" : "Expire untagged images after 1 day",
        "selection" : {
          "tagStatus" : "untagged",
          "countType" : "sinceImagePushed",
          "countUnit" : "days",
          "countNumber" : 1
        },
        "action" : {
          "type" : "expire"
        }
      },
      {
        "rulePriority" : 10,
        "description" : "Keep last 30 `prod-` tagged images",
        "selection" : {
          "tagStatus" : "tagged",
          "tagPrefixList" : [
            "prod-"
          ],
          "countType" : "imageCountMoreThan",
          "countNumber" : 30
        },
        "action" : {
          "type" : "expire"
        }
      },
      {
        "rulePriority" : 20,
        "description" : "Keep last 30 `staging-` tagged images",
        "selection" : {
          "tagStatus" : "tagged",
          "tagPrefixList" : [
            "staging-"
          ],
          "countType" : "imageCountMoreThan",
          "countNumber" : 30
        },
        "action" : {
          "type" : "expire"
        }
      },
      {
        "rulePriority" : 30,
        "description" : "Keep last 50 `dev-` tagged images",
        "selection" : {
          "tagStatus" : "tagged",
          "tagPrefixList" : [
            "dev-"
          ],
          "countType" : "imageCountMoreThan",
          "countNumber" : 50
        },
        "action" : {
          "type" : "expire"
        }
      }
    ]
  })
}
