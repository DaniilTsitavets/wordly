# Wordly — Infrastructure (Terragrunt)

Manages all AWS infrastructure for the Wordly app using Terragrunt + Terraform.

## Stack

| Tool | Version |
|---|---|
| Terraform | 1.15+ |
| Terragrunt | 1.0+ |
| AWS Provider | terraform-aws-modules |

Remote state is stored in S3 bucket `wordly-tg-tf-state` (region `us-east-1`), with DynamoDB table `wordly-tg-tf-state-lock` for locking.

## Directory structure

```
.
├── root.terragrunt.hcl          # Root config: remote state, provider, global hooks
├── _catalog/
│   ├── envcommon/               # Reusable envcommon configs (one per AWS module)
│   │   ├── cloudfront/
│   │   ├── ecs/
│   │   ├── iam/
│   │   └── ...
│   ├── functions/               # CloudFront Functions source (JS)
│   └── modules/                 # Custom local Terraform modules
└── environments/
    ├── _shared/                 # Resources shared across all envs (ECR, ACM, Route53, GitHub OIDC)
    │   └── us-east-1/
    │       ├── acm/wordly.quest/
    │       ├── ecr/wordly-app/
    │       ├── route53/wordly.quest/
    │       └── github-actions/
    └── dev/                     # Development environment
        ├── env.hcl              # Env-level variables (project, domain, tags, workload settings)
        ├── global/              # Region-agnostic resources (must deploy from us-east-1 per AWS)
        │   ├── cloudfront/      # CloudFront distribution
        │   ├── s3/frontend/     # S3 bucket — frontend SPA assets
        │   ├── s3/media/        # S3 bucket — media/mnemonic images
        │   └── route53-records/ # DNS records pointing to CloudFront
        └── us-east-1/           # Regional resources
            ├── vpc/
            ├── alb/             # Application Load Balancer (backend traffic)
            ├── ecs/cluster/     # ECS cluster
            ├── ecs/backend/     # ECS Fargate service + task for Spring Boot backend
            ├── rds/master/      # PostgreSQL RDS instance
            ├── rds/sg/          # RDS Security Group
            ├── secrets/ecs-backend/ # Secrets Manager secrets injected into ECS task
            └── data/            # Data sources (VPC, subnets, etc.)
```

## CloudFront routing

| Path | Origin | Notes |
|---|---|---|
| `/api/v1/ai/chat` | ALB | Streaming endpoint — caching disabled, longer timeout |
| `/api/*` | ALB | REST API — caching disabled |
| `/media/*` | S3 media | Images — caching optimized |
| `/*` (default) | S3 frontend | SPA — CloudFront Function handles SPA routing |

## Prerequisites

1. AWS CLI configured with sufficient permissions:
   ```bash
   aws configure  # or set AWS_PROFILE / AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
   ```

2. Terraform 1.15+ and Terragrunt 1.0+ installed:
   ```bash
   brew install terraform terragrunt
   ```

3. S3 bucket and DynamoDB table for remote state must already exist (one-time setup):
   ```
   Bucket:         wordly-tg-tf-state (us-east-1, versioning on, encryption on)
   DynamoDB table: wordly-tg-tf-state-lock (partition key: LockID)
   ```

## Running

All commands are run from inside a specific unit directory (e.g. `environments/dev/global/cloudfront`).

### Plan a single unit

```bash
cd environments/dev/global/cloudfront
terragrunt plan
```

### Apply a single unit

```bash
cd environments/dev/global/cloudfront
terragrunt apply
```

### Apply all units in an environment at once

```bash
cd environments/dev
terragrunt run-all apply
```

> `run-all` resolves dependency order automatically. Add `--terragrunt-non-interactive` to skip prompts in CI.

### Destroy a unit

```bash
cd environments/dev/global/cloudfront
terragrunt destroy
```

## Dependency order (dev environment)

Deploy shared resources first, then the rest follows the dependency graph that Terragrunt resolves automatically:

```
_shared: ecr → (manual image push) → acm → route53

dev: vpc → data
          └→ rds/sg → rds/master
          └→ alb
          └→ ecs/cluster → secrets/ecs-backend → ecs/backend
     s3/frontend
     s3/media
          └→ cloudfront (depends on: s3/frontend, s3/media, acm, alb)
                └→ route53-records
```

## Adding a new environment

1. Create `environments/<env>/env.hcl` — copy from `dev/env.hcl` and adjust `environment`, `prefix`, `app_domain`.
2. Create `environments/<env>/<region>/region.hcl` — set `aws_region` and `aws_region_short`.
3. Mirror the unit directories from `dev/`, each with a minimal `terragrunt.hcl` that includes root + envcommon.
4. Override any envcommon inputs via the `inputs` block if the new env needs different values.