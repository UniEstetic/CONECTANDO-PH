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
  default     = "https://connect-ph-api-939729604301.us-central1.run.app/api/v1"
}

variable "livekit_url" {
  description = "External LiveKit server URL (otro proyecto)"
  type        = string
  default     = "http://localhost:7880"
}

variable "frontend_url" {
  description = "Frontend URL (para NEXTAUTH_URL)"
  type        = string
  default     = "http://localhost:3000"
}

variable "auth_secret" {
  description = "AUTH_SECRET (min 32 chars)"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NEXTAUTH_SECRET (min 32 chars)"
  type        = string
  sensitive   = true
}

variable "auth_client_id" {
  description = "AUTH_CLIENT_ID del backend"
  type        = string
  default     = "550e8400-e29b-41d4-a716-446655440000"
}

variable "auth_client_secret" {
  description = "AUTH_CLIENT_SECRET del backend"
  type        = string
  sensitive   = true
}
