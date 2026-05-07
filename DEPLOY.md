# Guía de Deploy - Conectando PH

## 📋 Prerrequisitos

- Docker y Docker Compose instalados
- Git (opcional, para clonar el repositorio)
- Acceso a un servidor con puertos 3000 (frontend) y 3001 (backend) disponibles

## Pasos para Deploy

### 1. Clonar el repositorio (si no lo tienes localmente)

```bash
git clone <URL_DEL_REPOSITORIO>
cd CONECTANDO-PH
```

### 2. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tus valores
nano .env  # o usa tu editor preferido
```

**Variables requeridas en `.env`:**

```env
AUTH_SECRET=tu_clave_secreta_aqui
NEXTAUTH_SECRET=tu_clave_nextauth_aqui
AUTH_CLIENT_ID=tu_client_id_de_oauth
AUTH_CLIENT_SECRET=tu_client_secret_de_oauth
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXTAUTH_URL=http://tudominio.com
```

### 3. Construir las imágenes Docker

```bash
# Construir la imagen del frontend
docker-compose build

# O si prefieres construirlo directamente con Docker
docker build -t conectando-ph-frontend .
```

### 4. Ejecutar la aplicación

```bash
# Iniciar en modo detached (background)
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# O iniciar en modo foreground (para desarrollo)
docker-compose up
```

### 5. Verificar que la aplicación está corriendo

```bash
# Ver contenedores en ejecución
docker-compose ps

# Probar la API
curl http://localhost:3000

# Ver logs específicos del frontend
docker-compose logs frontend
```

## Comandos de Gestión

### Detener la aplicación

```bash
# Detener pero mantener los contenedores
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar incluyendo volúmenes
docker-compose down -v
```

### Reiniciar después de cambios

```bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar solo el frontend
docker-compose restart frontend
```

### Reconstruir después de actualizaciones de código

```bash
# Reconstruir sin cache
docker-compose build --no-cache

# Reconstruir y reiniciar
docker-compose up -d --build
```

## Configuración para Producción

### Usar Nginx como reverse proxy (recomendado)

1. **Crear `nginx.conf`**:

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Agregar Nginx al `docker-compose.yml`**:

```yaml
services:
  frontend:
    # ... configuración actual

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl  # Para certificates SSL
    depends_on:
      - frontend
    networks:
      - app-network
```

### Configurar HTTPS con Let's Encrypt

1. **Usar Docker Compose con Certbot**:

```yaml
services:
  frontend:
    # ... configuración actual

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - certbot-etc:/etc/letsencrypt
    depends_on:
      - frontend

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-etc:/etc/letsencrypt
    command: certonly --standalone --email tu-email@dominio.com --agree-tos -d tudominio.com
```

## Monitoreo

### Ver logs de todos los servicios

```bash
docker-compose logs
docker-compose logs --tail=100  # Últimas 100 líneas
```

### Ver recursos en uso

```bash
docker stats
```

### Inspeccionar contenedores

```bash
docker-compose exec frontend sh
```

## 🛠️ Solución de Problemas

### Error: Puerto 3000 ya en uso

```bash
# Ver qué proceso usa el puerto
lsof -i :3000

# Cambiar el puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambia 3000 por otro puerto
```

### Contenedor se reinicia continuamente

```bash
# Ver logs de error
docker-compose logs frontend

# Probar build localmente
docker-compose run --rm frontend npm run build
```

### Variables de entorno no cargadas

```bash
# Ver variables del contenedor
docker-compose exec frontend env

# Recrear contenedores
docker-compose down
docker-compose up -d
```

## Seguridad

### Actualizar secretos

1. Regenerar valores seguros:
```bash
openssl rand -base64 32
```

2. Actualizar en `.env` y reiniciar:
```bash
docker-compose down
docker-compose up -d
```

### Escaneo de vulnerabilidades

```bash
# Escanear imágenes
docker scan conectando-ph-frontend:latest

# Usar Trivy
trivy image conectando-ph-frontend:latest
```

## Deploy Automatizado (CI/CD)

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.6
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /ruta/a/CONECTANDO-PH
            git pull origin main
            docker-compose down
            docker-compose build --no-cache
            docker-compose up -d
```

## Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en `.env`
- [ ] Secrets generados correctamente
- [ ] Puerto 3000 disponible en el servidor
- [ ] Docker y Docker Compose instalados
- [ ] Espacio en disco suficiente (mínimo 2GB)
- [ ] Backup de base de datos (si aplica)
- [ ] Dominio configurado (si se usa HTTPS)

## Actualizaciones

### Actualización sin downtime

```bash
# 1. Construir nueva imagen
docker-compose build frontend

# 2. Escalar instancias (si usas múltiples)
docker-compose up -d --scale frontend=2

# 3. Esperar que el nuevo contenedor esté listo
sleep 10

# 4. Reducir a 1 instancia
docker-compose up -d --scale frontend=1
```

---

## Soporte

Para reportar issues o solicitar ayuda: [GitHub Issues](https://github.com/tu-usuario/CONECTANDO-PH/issues)
