variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "backend_url" {
  description = "External backend API URL (otro proyecto)"
  type        = string
  default     = "http://localhost:3001"
}

variable "livekit_url" {
  description = "External LiveKit server URL (otro proyecto)"
  type        = string
  default     = "http://localhost:7880"
}