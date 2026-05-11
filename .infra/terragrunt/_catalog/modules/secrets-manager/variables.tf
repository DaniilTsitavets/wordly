#-----------------------------------------------------------------------------------------------------------------------
# Variables
#-----------------------------------------------------------------------------------------------------------------------
variable "secret_name" {
  default     = ""
  type        = string
  description = "Secret name"
  validation {
    condition     = length(var.secret_name) > 0
    error_message = "The secret_name variable must be provided and cannot be empty."
  }
}

variable "secret_description" {
  default     = ""
  type        = string
  description = "Secret description"
}

variable "recovery_window_in_days" {
  default     = 30
  type        = number
  description = "Recovery window in days for secret deletion"
}
