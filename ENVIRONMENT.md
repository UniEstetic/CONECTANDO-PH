# Variables de Entorno - CONECTANDO-PH (Frontend Only)

## Frontend (Next.js)

| Variable | Descripción | Requerido | Producción (GCP) | Desarrollo |
|----------|-------------|----------|-----------------|------------|
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación | Si | `Conectando PH` | `Conectando PH` |
| `NEXT_PUBLIC_BACKEND_URL` | URL del backend API externo | Si | `https://api.tudominio.com/api/v1` | `http://localhost:3001/api/v1` |
| `AUTH_SECRET` | Secreto para firmar sesiones (mín 32 chars) | Si | **Secret Manager** | `.env` local |
| `NEXTAUTH_URL` | URL del frontend (prod) | Si | `https://tudominio.com` | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secreto de next-auth (mín 32 chars) | Si | **Secret Manager** | `.env` local |
| `NEXTAUTH_SESSION_TIMEOUT` | Timeout de sesión (segundos) | No | `3600` | `3600` |
| `AUTH_PROVIDER_DEFAULT` | Proveedor de auth | No | `accessEmail` | `accessEmail` |
| `AUTH_CLIENT_ID` | ID del cliente API | Si | **Secret Manager** | `.env` local |
| `AUTH_CLIENT_SECRET` | Secreto del cliente API | Si | **Secret Manager** | `.env` local |

> **Nota**: Backend API, WebSockets y LiveKit están en proyectos/servicios externos.

## Desarrollo Local

```bash
cp .env.example .env
# Editar valores para desarrollo local
npm run dev
```

## Producción (Google Cloud Run)

### 1. Pre-requisitos GCP

```bash
# Habilitar APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com

# Crear Artifact Registry repository
gcloud artifacts repositories create conectando-ph \
  --repository-format=docker \
  --location=us-central1

# Generar secrets (32+ caracteres aleatorios)
openssl rand -base64 32  # para AUTH_SECRET
openssl rand -base64 32  # para NEXTAUTH_SECRET
```

### 2. Crear Secret Manager secrets

```bash
# AUTH_SECRET
echo -n "tu-auth-secret-generado-aqui" | \
  gcloud secrets create AUTH_SECRET \
  --data-file=-

# NEXTAUTH_SECRET
echo -n "tu-nextauth-secret-generado-aqui" | \
  gcloud secrets create NEXTAUTH_SECRET \
  --data-file=-

# AUTH_CLIENT_SECRET (si es sensible)
echo -n "secreto-del-backend" | \
  gcloud secrets create AUTH_CLIENT_SECRET \
  --data-file=-

# AUTH_CLIENT_ID (opcional, si no es sensible puede ir en variables)
gcloud secrets create AUTH_CLIENT_ID \
  --data-file=- <<< "cliente"
```

### 3. Deploy con Terraform

```bash
cd infrastructure/terraform

# Inicializar
terraform init

# Aplicar (reemplazar valores)
terraform apply \
  -var="project_id=TU_PROJECT_ID" \
  -var="backend_url=https://api.tudominio.com/api/v1" \
  -var="frontend_url=https://tudominio.com" \
  -var="auth_secret=projects/TU_PROJECT_ID/secrets/AUTH_SECRET/latest" \
  -var="nextauth_secret=projects/TU_PROJECT_ID/secrets/NEXTAUTH_SECRET/latest" \
  -var="auth_client_id=cliente" \
  -var="auth_client_secret=projects/TU_PROJECT_ID/secrets/AUTH_CLIENT_SECRET/latest"
```

> **IMPORTANTE**: Asegúrate que el Service Account de Cloud Run tenga el rol `Secret Manager Secret Accessor` para acceder a los secrets.

### 4. O Deploy con Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml
```

El Cloud Build ejecutará automáticamente:
1. `npm ci` (instalación de dependencias)
2. `npm run lint` (validación de código)
3. `npm run typecheck` (validación de types)
4. `npm run build` (build de Next.js)
5. Push a Artifact Registry
6. Deploy a Cloud Run

## Configuración de Dominio (Opcional)

 Cloud Run provee SSL automático con dominio `*.run.app`. Para dominio personalizado:

```bash
# Mapear dominio personalizado
gcloud run domain-mappings create \
  --service=conectando-ph-frontend \
  --domain=tudominio.com
```

## Arquitectura Distribuida

```
GCP (Este proyecto)
┌────────────────────────────────────────────┐
│         Cloud Run - Frontend               │
│         (Next.js 14)                       │
└──────────────┬─────────────────────────────┘
               │ API calls (HTTPS)
               ▼
    ┌─────────────────────────────────────────┐
    │   Backend API (otro proyecto GCP)       │
    │   Cloud Run / Compute Engine            │
    │   Puerto: 3001                          │
    └───────────────┬─────────────────────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│PostgreSQL│ │LiveKit   │ │Socket.io │
│Cloud SQL │ │Server    │ │Server    │
│          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘
```

## Troubleshooting

### Error: "server.js not found"
El Dockerfile espera el output `standalone` de Next.js. Verificar que `next.config.ts` tenga:
```ts
export default {
  output: 'standalone',
  // ...
}
```

### Error: Secrets no encontrados
Verificar que el Service Account de Cloud Run tenga el rol:
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:$(gcloud run services describe conectando-ph-frontend --format='value(spec.template.spec.serviceAccountName)') \
  --role=roles/secretmanager.secretAccessor
```

### Error: Backend no reachable
Verificar que `NEXT_PUBLIC_BACKEND_URL` sea accesible desde Cloud Run y tenga CORS habilitado para el dominio de Cloud Run (`*.run.app`).
