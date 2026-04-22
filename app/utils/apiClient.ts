'use server';

import { auth } from "@/app/api/auth/[...nextauth]/auth.config";
import { signOut } from "@/app/api/auth/[...nextauth]/auth.config";
const URL_BACKEND = process?.env?.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api/v1";
const CLIENT_ID = process?.env?.AUTH_CLIENT_ID;
const SECRET_ID = process?.env?.AUTH_CLIENT_SECRET;

function buildNetworkError() {
  return new Error(
    'No se pudo completar la solicitud en este momento. Intenta nuevamente en unos minutos.',
  );
}

function buildConfigError() {
  return new Error('Falta configuracion de autenticacion del cliente API.');
}

function buildSessionExpiredError() {
  return new Error('Tu sesion ha expirado. Inicia sesion nuevamente.');
}

function isAuthFailureStatus(status: number) {
  return status === 401 || status === 403;
}

async function closeUserSession() {
  try {
    await signOut({ redirect: false });
  } catch {
    // Evita romper el flujo si el cierre local falla por contexto de ejecucion.
  }
}

function buildHeaders(options: RequestInit, token?: string): Headers {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

// Es una función centralizada para hacer todas las peticiones HTTP a la API.
export async function apiClient(
  url: string,
  options: RequestInit = {}
) { 
  if (!CLIENT_ID || !SECRET_ID) {
    throw buildConfigError();
  }

  try {
    const headers = buildHeaders(options);
    headers.set('client-id', CLIENT_ID);
    headers.set('client-secret', SECRET_ID);

    const res = await fetch(`${URL_BACKEND}${url}`, {
      ...options,
      credentials: 'include', // Incluir cookies automáticamente
      headers,
    });

    return res;
  } catch {
    throw buildNetworkError();
  }
}

// Es una función centralizada para hacer todas las peticiones HTTP a la API.
export async function apiClientSession(
  url: string,
  options: RequestInit = {}
) { 

  const session = await auth();
  const token = session?.accessToken;

  if (!token || session?.error) {
    await closeUserSession();
    throw buildSessionExpiredError();
  }

  try {
    const res = await fetch(`${URL_BACKEND}${url}`, {
      ...options,
      headers: buildHeaders(options, token),
    });

    if (isAuthFailureStatus(res.status)) {
      await closeUserSession();
    }

    return res;
  } catch {
    throw buildNetworkError();
  }
} 