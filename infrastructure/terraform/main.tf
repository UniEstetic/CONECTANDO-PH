terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
  
  backend "gcs" {
    bucket = "conectando-ph-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Run Frontend
resource "google_cloudrun_service" "frontend" {
  name     = "conectando-ph-frontend"
  location = var.region
  
  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.io/${var.project_id}/conectando-ph/frontend:latest"
        ports {
          container_port = 3000
        }
        env {
          name  = "NEXT_PUBLIC_APP_NAME"
          value = "Conectando PH"
        }
        env {
          name  = "NEXT_PUBLIC_BACKEND_URL"
          value = var.backend_url
        }
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM - Allow public access
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_cloudrun_service_iam_policy" "frontend_noauth" {
  location    = google_cloudrun_service.frontend.location
  name       = google_cloudrun_service.frontend.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "docker" {
  format        = "DOCKER"
  location      = var.region
  repository_id = "conectando-ph"
  description  = "Docker repository for CONECTANDO-PH"
}

# Output
output "frontend_url" {
  value = google_cloudrun_service.frontend.status[0].url
}