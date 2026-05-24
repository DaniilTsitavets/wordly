# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/iam/aws//modules/iam-github-oidc-role?version=5.52.2"
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# ----------------------------------------------------------------------------------------------------------------------
locals {
  environment_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))

  env    = local.environment_vars.locals.environment.short
  prefix = local.environment_vars.locals.prefix
}

# ----------------------------------------------------------------------------------------------------------------------
# Dependencies
# ----------------------------------------------------------------------------------------------------------------------

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  name = "${local.environment_vars.locals.project}-github-actions"

  subjects = [
    "repo:DaniilTsitavets/wordly:pull_request",
    "repo:DaniilTsitavets/wordly:ref:refs/heads/*", # TODO: remove after testing
    "repo:DaniilTsitavets/wordly:ref:refs/heads/main",
    "repo:DaniilTsitavets/wordly:ref:refs/heads/develop",
    "repo:DaniilTsitavets/wordly:environment:Development",
    "repo:DaniilTsitavets/wordly:environment:Staging",
    "repo:DaniilTsitavets/wordly:environment:Production",
  ]

  policies = {
    ECRPush        = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
    ECSDeploy      = "arn:aws:iam::aws:policy/AmazonECS_FullAccess"
    S3Deploy       = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
    CFDeploy       = "arn:aws:iam::aws:policy/CloudFrontFullAccess"
    DynamoDBLock   = "arn:aws:iam::381234267810:policy/github-oidc/github-oidc-dynamodb-policy"
    ECSDeployIAM   = "arn:aws:iam::381234267810:policy/github-oidc/github-oidc-iam-access-policy"
    CloudWatchLogs = "arn:aws:iam::381234267810:policy/github-oidc/github-oidc-cloudwatch-policy"
  }
}
