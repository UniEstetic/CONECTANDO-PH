# Guía de Deploy en Google Cloud Platform - Conectando PH

## Prerrequisitos

- Cuenta de Google Cloud Platform (GCP)
- Facturación habilitada en el proyecto
- Google Cloud SDK (`gcloud`) instalado localmente
- Docker instalado
- Git (opcional)

## Arquitectura en GCP

Este proyecto utiliza:
- **Cloud Run**: Para ejecutar el frontend Next.js (serverless)
- **Artifact Registry**: Repositorio de imágenes Docker
- **Cloud Build**: CI/CD para construir y desplegar
- **Terraform**: Infraestructura como código (opcional)

## Pasos para Deploy

### 1. Configurar Google Cloud Project

```bash
# Iniciar sesión en GCP
gcloud auth login

# Seleccionar o crear proyecto
gcloud projects create conectando-ph --name="Conectando PH"
gcloud config set project PROJECT_ID

# Habilitar APIs necesarias
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  compute.googleapis.com \
  iam.googleapis.com
```

### 2. Configurar Artifact Registry

```bash
# Crear repositorio en Artifact Registry
gcloud artifacts repositories create conectando-ph \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for CONECTANDO-PH"

# Configurar Docker para autenticarse con Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 3. Configurar Secrets en GCP (Recomendado)

```bash
# Crear secretos en Secret Manager (más seguro que variables de entorno)
gcloud secrets create AUTH_SECRET --replication-policy="automatic"
gcloud secrets create NEXTAUTH_SECRET --replication-policy="automatic"
gcloud secrets create AUTH_CLIENT_ID --replication-policy="automatic"
gcloud secrets create AUTH_CLIENT_SECRET --replication-policy="automatic"

# Agregar valores a los secretos
echo -n "tu_valor_secreto" | gcloud secrets versions add AUTH_SECRET --data-file=-
```

### 4. Deploy con Cloud Build (Automático)

**Opción A: Deploy desde tu máquina local**

```bash
# Construir y desplegar con Cloud Build
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions=_REGION=us-central1

# O usar el archivo de build extendido (con typecheck)
gcloud builds submit \
  --config cloudbuild.build.yaml \
  --substitutions=_REGION=us-central1
```

**Opción B: Configurar trigger automático en GitHub**

1. Ir a Google Cloud Console → Cloud Build → Triggers
2. Crear nuevo trigger:
   - Conectar repositorio de GitHub
   - Seleccionar rama (main/master)
   - Configurar `cloudbuild.yaml` como archivo de build
   - Agregar substituciones:
     ```
     _REGION=us-central1
     ```

### 5. Deploy con Terraform (Infraestructura como Código)

```bash
cd infrastructure/terraform

# Inicializar Terraform
terraform init

# Planificar cambios
terraform plan \
  -var="project_id=PROJECT_ID" \
  -var="region=us-central1" \
  -var="auth_secret=tu_auth_secret" \
  -var="nextauth_secret=tu_nextauth_secret" \
  -var="auth_client_id=tu_client_id" \
  -var="auth_client_secret=tu_client_secret" \
  -var="frontend_url=https://tudominio.com" \
  -var="backend_url=https://api.tudominio.com"

# Aplicar cambios
terraform apply \
  -var="project_id=PROJECT_ID" \
  -var="region=us-central1" \
  -var="auth_secret=tu_auth_secret" \
  -var="nextauth_secret=tu_nextauth_secret" \
  -var="auth_client_id=tu_client_id" \
  -var="auth_client_secret=tu_client_secret" \
  -var="frontend_url=https://tudominio.com" \
  -var="backend_url=https://api.tudominio.com"
```

**Usar archivo `terraform.tfvars` (recomendado para secrets):**

```hcl
project_id     = "conectando-ph"
region         = "us-central1"
backend_url    = "https://connect-ph-api-939729604301.us-central1.run.app/api/v1"
frontend_url   = "https://conectando-ph.web.app"
auth_secret    = "valor_desde_secret_manager"
nextauth_secret = "valor_desde_secret_manager"
auth_client_id = "550e8400-e29b-41d4-a716-446655440000"
auth_client_secret = "valor_desde_secret_manager"
```

```bash
terraform apply -var-file="terraform.tfvars"
```

### 6. Deploy Manual (Docker Directo)

```bash
# Construir imagen localmente
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph/frontend:latest .

# Autenticarse con GCP
gcloud auth configure-docker us-central1-docker.pkg.dev

# Subir imagen
docker push us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph/frontend:latest

# Desplegar en Cloud Run
gcloud run deploy conectando-ph-frontend \
  --image=us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph/frontend:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="NEXT_PUBLIC_APP_NAME=Conectando PH" \
  --set-env-vars="NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com" \
  --set-env-vars="AUTH_SECRET=tu_secret" \
  --set-env-vars="NEXTAUTH_URL=https://tudominio.com" \
  --set-env-vars="NEXTAUTH_SECRET=tu_nextauth_secret" \
  --set-env-vars="AUTH_CLIENT_ID=tu_client_id" \
  --set-env-vars="AUTH_CLIENT_SECRET=tu_client_secret" \
  --port=3000
```

### 7. Configurar Dominio Personalizado (Opcional)

```bash
# Mapear dominio personalizado a Cloud Run
gcloud run domain-mappings create \
  --service=conectando-ph-frontend \
  --domain=tudominio.com \
  --region=us-central1

# Verificar mapeo
gcloud run domain-mappings describe \
  --domain=tudominio.com \
  --region=us-central1
```

**Configurar DNS:**
Agregar registros DNS que apunten a Cloud Run:
```
Tipo: CNAME
Nombre: www
Valor: ghs.googlehosted.com
```

## Comandos de Gestión

### Ver estado del despliegue

```bash
# Ver servicios de Cloud Run
gcloud run services list --region=us-central1

# Ver detalles del servicio
gcloud run services describe conectando-ph-frontend --region=us-central1

# Ver revisiones
gcloud run revisions list --service=conectando-ph-frontend --region=us-central1
```

### Ver logs

```bash
# Logs en tiempo real
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=conectando-ph-frontend" --limit=50 --format="json"

# Logs con filtro de error
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=conectando-ph-frontend AND severity>=ERROR" --limit=20

# Seguir logs (similar a tail -f)
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=conectando-ph-frontend"
```

### Gestionar Cloud Run

```bash
# Escalar (ajuste manual de CPU/memoria)
gcloud run services update-conectando-ph-frontend \
  --region=us-central1 \
  --cpu=1 \
  --memory=512Mi

# Escalar a 0 (detener, ahorra costos)
gcloud run services update-conectando-ph-frontend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=0

# Escalar automáticamente
gcloud run services update-conectando-ph-frontend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=10
```

### Gestionar Artifact Registry

```bash
# Listar imágenes
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph

# Eliminar imagen específica
gcloud artifacts docker images delete \
  us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph/frontend:tag \
  --delete-tags

# Configurar políticas de retención
gcloud artifacts repositories update conectando-ph \
  --location=us-central1 \
  --cleanup-policy-days=30
```

## Optimización de Costos

### Configurar Cloud Run para ahorrar

```bash
# Establecer mínimo en 0 (solo pagues cuando se usa)
gcloud run services update conectando-ph-frontend \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=5

# Limitar CPU/memoria
gcloud run services update conectando-ph-frontend \
  --region=us-central1 \
  --cpu=1 \
  --memory=256Mi
```

### Configurar presupuestos y alertas

```bash
# Crear presupuesto
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Conectando PH Budget" \
  --budget-amount=50 \
  --threshold-rule=threshold_percent=0.8

# Configurar alertas
gcloud billing budgets update BUDGET_ID \
  --add-threshold-rule=threshold_percent=0.9
```

## Actualizaciones (Zero Downtime)

### CI/CD Automático con Cloud Build

El deploy actual ya está configurado para cero downtime:
1. Cloud Build construye nueva imagen
2. Sube a Artifact Registry
3. Cloud Run crea nueva revisión
4. Tráfico se migra gradualmente

**Forzar deploy manual:**

```bash
gcloud builds submit --config cloudbuild.yaml

# O con tags para versionado
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=TAG_NAME=v1.0.1
```

### Rollback a versión anterior

```bash
# Listar revisiones
gcloud run revisions list --service=conectando-ph-frontend --region=us-central1

# Revertir a revisión específica
gcloud run services update-traffic conectando-ph-frontend \
  --region=us-central1 \
  --to-revisions=REVISION_NAME=100
```

## Seguridad

### Configurar IAM y Service Accounts

```bash
# Crear service account para Cloud Run
gcloud iam service-accounts create conectando-ph-sa \
  --display-name="Conectando PH Service Account"

# Otorgar roles mínimos
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:conectando-ph-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"

# Desplegar con service account específica
gcloud run deploy conectando-ph-frontend \
  --image=... \
  --service-account=conectando-ph-sa@PROJECT_ID.iam.gserviceaccount.com
```

### Configurar VPC Connector (si necesita acceso a recursos privados)

```bash
# Crear conector VPC
gcloud compute networks vpc-access connectors create conectando-ph-connector \
  --network=default \
  --region=us-central1 \
  --range=10.8.0.0/28

# Desplegar con conector
gcloud run deploy conectando-ph-frontend \
  --image=... \
  --vpc-connector=conectando-ph-connector \
  --region=us-central1
```

## Monitoreo y Observabilidad

### Cloud Monitoring

```bash
# Ver métricas de Cloud Run
gcloud monitoring metrics list --filter="metric.type=run.googleapis.com/request_count"

# Crear alerta de errores
gcloud monitoring policies create \
  --policy-from-file="alert-policy.json"
```

**Ejemplo `alert-policy.json`:**
```json
{
  "displayName": "High Error Rate",
  "conditions": [{
    "displayName": "Error rate > 5%",
    "conditionThreshold": {
      "filter": "metric.type=\"run.googleapis.com/request_count\" AND resource.label.service_name=\"conectando-ph-frontend\"",
      "comparison": "COMPARISON_GT",
      "thresholdValue": 0.05,
      "duration": "60s",
      "trigger": {"count": 1}
    }
  }],
  "alertStrategy": {"autoClose": "604800s"}
}
```

### Cloud Logging

```bash
# Exportar logs a BigQuery para análisis
gcloud logging sinks create conectando-ph-logs \
  bigquery.googleapis.com/projects/PROJECT_ID/datasets/conectando_ph_logs

# Ver logs estructurados
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="conectando-ph-frontend"' \
  --format="json" > logs.json
```

## Solución de Problemas

### Error: "Quota exceeded"

```bash
# Ver quotas actuales
gcloud compute project-info describe --project=PROJECT_ID

# Solicitar aumento de quota
# Ir a Console → IAM & Admin → Quotas
# Filtrar por "Cloud Run" y solicitar aumento
```

### Error: "Image not found"

```bash
# Verificar que la imagen existe
gcloud artifacts docker images list us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph

# Reconstruir y reintentar
gcloud builds submit --config cloudbuild.yaml
```

### Error: "Permission denied" en Secret Manager

```bash
# Otorgar permisos a Cloud Run
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Cloud Run no arranca (crash loop)

```bash
# Ver logs de inicio
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=conectando-ph-frontend AND severity>=ERROR" --limit=20 --format="text"

# Obtener logs del contenedor
gcloud run services describe conectando-ph-frontend --region=us-central1 --format="value(status.url)"
# Luego usar Cloud Console para ver detalles
```

## Configuración de Redes

### VPC y Firewall

```bash
# Crear VPC (si es necesario)
gcloud compute networks create conectando-ph-vpc --subnet-mode=auto

# Crear regla de firewall para permitir tráfico
gcloud compute firewall-rules create allow-conectando-ph \
  --network=default \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:3000 \
  --source-ranges=0.0.0.0/0
```

### Conector Serverless VPC (para conectar a Cloud SQL, etc.)

```bash
# Crear conector
gcloud compute networks vpc-access connectors create conectando-ph-connector \
  --network default \
  --region us-central1 \
  --range 10.8.0.0/28

# Desplegar Cloud Run con conector
gcloud run deploy conectando-ph-frontend \
  --image=us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph/frontend:latest \
  --region=us-central1 \
  --vpc-connector=conectando-ph-connector \
  --vpc-egress=all
```

## Variables de Entorno en Producción

Para producción, actualizar las variables en Terraform:

```hcl
variable "frontend_url" {
  description = "Frontend URL (para NEXTAUTH_URL)"
  type        = string
  default     = "https://conectando-ph.web.app"  # Cambiar por tu dominio
}

variable "backend_url" {
  description = "External backend API URL"
  type        = string
  default     = "https://tu-backend-api.run.app/api/v1"
}
```

O actualizar directamente en Cloud Run:

```bash
gcloud run services update-conectando-ph-frontend \
  --region=us-central1 \
  --update-env-vars="NEXT_PUBLIC_BACKEND_URL=https://nuevo-backend.com"
```

## 🔄 Rollback y Versionado

### Versionado Semántico con Tags

```bash
# Build con tag específico
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=TAG_NAME=v1.2.3,_REGION=us-central1

# Desplegar versión específica
gcloud run deploy conectando-ph-frontend \
  --image=us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph/frontend:v1.2.3 \
  --region=us-central1
```

### Rollback Automatizado

Si una nueva versión falla:

```bash
# Volver a la revisión anterior
gcloud run services update-traffic conectando-ph-frontend \
  --region=us-central1 \
  --to-revisions=LATEST_REVISION=0

# O desplegar la imagen anterior
gcloud run deploy conectando-ph-frontend \
  --image=us-central1-docker.pkg.dev/PROJECT_ID/conectando-ph/frontend:v1.2.2 \
  --region=us-central1
```

## Monitoreo de Costos

```bash
# Ver costos del proyecto
gcloud billing accounts list
gcloud beta billing budgets list --billing-account=BILLING_ACCOUNT_ID

# Exportar datos de costos a BigQuery
bq mk --location=US billing_export
bq query --use_legacy_sql=false 'SELECT * FROM `billing.gcp_billing_export_v1_XXXXXX` LIMIT 100'

# Configurar alerta de costo
gcloud monitoring policies create --policy-from-file="cost-alert.json"
```

## Mejores Prácticas de Seguridad

1. **Nunca commitar secrets**:
   ```bash
   # Usar Secret Manager
   echo "mi_secret" | gcloud secrets versions add SECRET_NAME --data-file=-
   ```

2. **Configurar acceso mínimo**:
   ```bash
   # Revisar IAM
   gcloud projects get-iam-policy PROJECT_ID
   ```

3. **Habilitar VPC Service Controls**:
   ```bash
   gcloud access-context-manager perimeters create \
     --name="conectando-ph-perimeter" \
     --resources=projects/PROJECT_ID \
     --restricted-services=run.googleapis.com
   ```

4. **Auditar con Forseti Security o similar**

## Checklist Pre-Producción

- [ ] Project ID configurado correctamente
- [ ] APIs habilitadas (Cloud Run, Cloud Build, Artifact Registry)
- [ ] Artifact Registry creado
- [ ] Secrets configurados en Secret Manager
- [ ] Dominio personalizado configurado (si aplica)
- [ ] SSL/TLS configurado (automático en Cloud Run con dominio)
- [ ] Service Account con roles mínimos
- [ ] Budgets y alertas de costo configurados
- [ ] Monitoring y logging habilitados
- [ ] Backup strategy definida
- [ ] VPC Connector configurado (si necesita recursos privados)
- [ ] IAM policies revisadas

## Soporte GCP

- Documentación Cloud Run: https://cloud.google.com/run/docs
- Precios: https://cloud.google.com/run/pricing
- Status: https://status.cloud.google.com/
- Soporte: https://cloud.google.com/support

---

**Nota**: Este proyecto está optimizado para Google Cloud Run serverless. Los primeros 2 millones de solicitudes por mes son gratuitos. Revisar precios actualizados en la documentación oficial.
