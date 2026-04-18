# Variables de Entorno - CONECTANDO-PH (Frontend Only)

## Frontend (Next.js)

| Variable | Descripción | Requerido | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_APP_NAME` | Nombre de la aplicación | Si | `Conectando PH` |
| `NEXT_PUBLIC_BACKEND_URL` | URL del backend API externo | Si | `http://localhost:3001` |
| `AUTH_SECRET` | Secreto para firmar sesiones | Si | - |
| `NEXTAUTH_URL` | URL del frontend (prod) | Si | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secreto de next-auth | Si | - |
| `NEXTAUTH_SESSION_TIMEOUT` | Timeout de sesión (segundos) | No | `3600` |
| `AUTH_PROVIDER_DEFAULT` | Proveedor de auth | No | `accessEmail` |
| `AUTH_CLIENT_ID` | ID del cliente API | Si | - |
| `AUTH_CLIENT_SECRET` | Secreto del cliente API | Si | - |

> **Nota**: backend API, sockets y LiveKit están en proyectos externos.

## Desarrollo Local

```bash
cp .env.example .env
# Editar con valores deseados
```

## Producción (GCP)

Las variables se injectan via Cloud Run Environment variables.

## Arquitectura Distribuida

```
┌──────────────────────────────────────────────────┐
│                  GCP (Este proyecto)              │
│  ┌────────────────────────────────────────────┐ │
│  │         Cloud Run - Frontend               │ │
│  │         (Next.js 14)                     │ │
│  └──────────────┬─────────────────────────────┘ │
└─────────────────┼─────────────────────────────┘
                  │ API calls
                  ▼
    ┌─────────────────────────────────────────┐
    │   Backend API (otro proyecto)           │
    │   Puerto: 3001                         │
    └─────────────────┬───────────────────────┘
                      │
      ┌───────────────┼───────────────┐
      ▼               ▼               ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│ WebSocket │  │  LiveKit  │  │  DB      │
│ (otro     │  │ (otro     │  │ (external│
│ proyecto)│  │ proyecto)│  │  o Cloud │
│          │  │          │  │  SQL)    │
└───────────┘  └───────────┘  └───────────┘
```