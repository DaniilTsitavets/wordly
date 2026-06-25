# ----------------------------------------------------------------------------------------------------------------------
# Terraform Module Source
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  source = "tfr:///terraform-aws-modules/cloudfront/aws/?version=6.4.0"
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
dependency "s3-frontend" {
  config_path = "${get_terragrunt_dir()}/../s3/frontend"

  mock_outputs = {
    s3_bucket_bucket_regional_domain_name = "mock-frontend.s3.amazonaws.com"
  }
}

dependency "s3-media" {
  config_path = "${get_terragrunt_dir()}/../s3/media"

  mock_outputs = {
    s3_bucket_bucket_regional_domain_name = "mock-media.s3.amazonaws.com"
  }
}

dependency "acm" {
  config_path = "${get_terragrunt_dir()}/../../../_shared/us-east-1/acm/${local.environment_vars.locals.app_domain}/"

  mock_outputs = {
    acm_certificate_arn = "arn:aws:acm:us-east-1:000000000000:certificate/aaaaaaaa-bbbb-cccc-dddd-ffffffffffff"
  }
}

dependency "alb" {
  config_path = "${get_terragrunt_dir()}/../../us-east-1/alb/"

  mock_outputs = {
    dns_name = "mock-alb-111111aaaa11a1a1.elb.us-east-1.amazonaws.com"
  }
}

# ----------------------------------------------------------------------------------------------------------------------
# Module Input Variables
# ----------------------------------------------------------------------------------------------------------------------
inputs = {
  create              = true
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"
  http_version        = "http2"
  retain_on_delete    = false
  wait_for_deployment = false
  default_root_object = "index.html"
  comment             = "${local.prefix}-cf"

  aliases = ["${local.env}.${local.environment_vars.locals.app_domain}"]

  origin_access_control = {
    s3-frontend = {
      name             = "${local.prefix}-frontend-oac"
      description      = "CloudFront access to S3 frontend assets"
      origin_type      = "s3"
      signing_behavior = "always"
      signing_protocol = "sigv4"
    }
    s3-media = {
      name             = "${local.prefix}-media-oac"
      description      = "CloudFront access to S3 media assets"
      origin_type      = "s3"
      signing_behavior = "always"
      signing_protocol = "sigv4"
    }
  }

    cloudfront_functions = {
    viewer-request-handler = {
      name    = "${replace(basename(get_terragrunt_dir()), ".", "-")}-viewer-request-handler-${local.prefix}"
      runtime = "cloudfront-js-2.0"
      comment = "SPA routing"
      code    = file("${dirname(find_in_parent_folders("root.terragrunt.hcl"))}/_catalog/functions/viewer-request-handler.js")
      publish = true
    }
  }

  origin = {
    s3-frontend = {
      domain_name               = dependency.s3-frontend.outputs.s3_bucket_bucket_regional_domain_name
      origin_access_control_key = "s3-frontend"
    }

    s3-media = {
      domain_name               = dependency.s3-media.outputs.s3_bucket_bucket_regional_domain_name
      origin_access_control_key = "s3-media"
    }

    alb = {
      domain_name = dependency.alb.outputs.dns_name

      custom_origin_config = {
        http_port              = 8080
        https_port             = 443
        origin_read_timeout    = 120
        origin_protocol_policy = "http-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
  }

  # Default: serve SPA from S3
  default_cache_behavior = {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    compress        = true
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized

    function_association = {
      viewer-request = {
        function_key = "viewer-request-handler"
      }
    }
  }

  ordered_cache_behavior = [
    {
      path_pattern           = "/api/v1/ai/chat"
      target_origin_id       = "alb"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods  = ["GET", "HEAD"]

      compress                   = false
      cache_policy_id            = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingDisabled
      response_headers_policy_id = "5cc3b908-e619-4b99-88e5-2cf7f45965bd" # Managed-CORS-With-Preflight
      origin_request_policy_id   = "216adef6-5c7f-47e4-b989-5492eafa07d3" # Managed-AllViewer
    },
    {
      # Backend REST API
      path_pattern           = "/api/*"
      target_origin_id       = "alb"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods  = ["GET", "HEAD"]

      compress                   = true
      cache_policy_id            = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingDisabled
      response_headers_policy_id = "5cc3b908-e619-4b99-88e5-2cf7f45965bd" # Managed-CORS-With-Preflight
      origin_request_policy_id   = "216adef6-5c7f-47e4-b989-5492eafa07d3" # Managed-AllViewer
    },
    {
      # Media assets from S3
      path_pattern           = "/media/*"
      target_origin_id       = "s3-media"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD"]
      cached_methods  = ["GET", "HEAD"]

      compress        = true
      cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    },
  ]

  viewer_certificate = {
    acm_certificate_arn      = dependency.acm.outputs.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}