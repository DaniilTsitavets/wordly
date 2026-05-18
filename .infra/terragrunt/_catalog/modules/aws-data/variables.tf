variable "secret_prefix" {
  description = "Prefix for Secrets Manager paths (project name)"
  type        = string
}

variable "environment" {
  description = "Environment short name (e.g. dev, prod)"
  type        = string
}