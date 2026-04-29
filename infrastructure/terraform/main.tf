terraform {
  required_version = ">= 1.0"
<<<<<<< HEAD
  
=======

>>>>>>> deploy/23042026
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
<<<<<<< HEAD
  
=======

>>>>>>> deploy/23042026
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
<<<<<<< HEAD
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
        env = [
          {
            name  = "NEXT_PUBLIC_APP_NAME"
            value = "Conectando PH"
          },
          {
            name  = "NEXT_PUBLIC_BACKEND_URL"
            value = var.backend_url
          },
          {
            name  = "AUTH_SECRET"
            value = var.auth_secret
          },
          {
            name  = "NEXTAUTH_URL"
            value = var.frontend_url
          },
          {
            name  = "NEXTAUTH_SECRET"
            value = var.nextauth_secret
          },
          {
            name  = "NEXTAUTH_SESSION_TIMEOUT"
            value = "3600"
          },
          {
            name  = "AUTH_PROVIDER_DEFAULT"
            value = "accessEmail"
          },
          {
            name  = "AUTH_CLIENT_ID"
            value = var.auth_client_id
          },
          {
            name  = "AUTH_CLIENT_SECRET"
            value = var.auth_client_secret
          }
        ]
      }
    }
  }
  
=======
resource "google_cloud_run_service" "frontend" {
  name     = "conectando-ph-frontend"
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/conectando-ph/frontend:latest"
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
        env {
          name  = "AUTH_SECRET"
          value = var.auth_secret
        }
        env {
          name  = "NEXTAUTH_URL"
          value = var.frontend_url
        }
        env {
          name  = "NEXTAUTH_SECRET"
          value = var.nextauth_secret
        }
        env {
          name  = "NEXTAUTH_SESSION_TIMEOUT"
          value = "3600"
        }
        env {
          name  = "AUTH_PROVIDER_DEFAULT"
          value = "accessEmail"
        }
        env {
          name  = "AUTH_CLIENT_ID"
          value = var.auth_client_id
        }
        env {
          name  = "AUTH_CLIENT_SECRET"
          value = var.auth_client_secret
        }
      }
    }
  }

>>>>>>> deploy/23042026
  traffic {
    percent         = 100
    latest_revision = true
  }
}

# IAM - Allow public access
data "google_iam_policy" "noauth" {
  binding {
<<<<<<< HEAD
    role = "roles/run.invoker"
=======
    role    = "roles/run.invoker"
>>>>>>> deploy/23042026
    members = ["allUsers"]
  }
}

<<<<<<< HEAD
resource "google_cloudrun_service_iam_policy" "frontend_noauth" {
  location    = google_cloudrun_service.frontend.location
  name       = google_cloudrun_service.frontend.name
=======
resource "google_cloud_run_service_iam_policy" "frontend_noauth" {
  location    = google_cloud_run_service.frontend.location
  service     = google_cloud_run_service.frontend.name
>>>>>>> deploy/23042026
  policy_data = data.google_iam_policy.noauth.policy_data
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "docker" {
  format        = "DOCKER"
  location      = var.region
  repository_id = "conectando-ph"
<<<<<<< HEAD
  description  = "Docker repository for CONECTANDO-PH"
=======
  description   = "Docker repository for CONECTANDO-PH"
>>>>>>> deploy/23042026
}

# Output
output "frontend_url" {
<<<<<<< HEAD
  value = google_cloudrun_service.frontend.status[0].url
=======
  value = google_cloud_run_service.frontend.status[0].url
>>>>>>> deploy/23042026
}
