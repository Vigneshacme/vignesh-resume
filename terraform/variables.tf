variable "project_id" {
  description = "The Google Cloud / Firebase Project ID"
  type        = string
  default     = "vignesh-resume-dbaaf"
}

variable "region" {
  description = "The Google Cloud region for Firestore and Cloud Functions"
  type        = string
  default     = "us-central1"
}
