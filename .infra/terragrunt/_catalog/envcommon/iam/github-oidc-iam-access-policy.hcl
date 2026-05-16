# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/iam/aws//modules/iam-policy?version=6.4.0"
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
  name        = "github-oidc-iam-access-policy"
  path        = "/github-oidc/"
  description = "Policy for GitHub OIDC roles to manage ecs IAM roles"
  policy      = <<-EOF
 {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowIAMRoleManagement",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:ListRolePolicies",
        "iam:ListAttachedRolePolicies",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:PutRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:GetPolicy",
        "iam:GetPolicyVersion",
        "iam:ListPolicyVersions",
        "iam:CreatePolicyVersion",
        "iam:DeletePolicyVersion"
      ],
      "Resource": [
        "arn:aws:iam::381234267810:role/wordly-dev-use1-*",
        "arn:aws:iam::381234267810:policy/wordly-dev-use1-*"
      ]
    }
  ]
}
EOF
}
