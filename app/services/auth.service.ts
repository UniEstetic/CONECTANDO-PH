'use server';

import { apiClient, apiClientSession } from "@/app/utils/apiClient";
import {
  UserAuth,
  SelectProviderResponse,
  ValidateLoginResponse,
  RefreshTokenResponse,
} from "@/app/types/next-auth";

// Seleccionar proveedor de autenticación
export async function selectProvider(providerName: string) {
  const res = await apiClient("/auth/select", {
    method: "POST",
    body: JSON.stringify({ providerName }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.message || `Error al seleccionar proveedor (${res.status})`,
    );
  }

  return res.json() as Promise<SelectProviderResponse>;
}
// Validar login 
export async function validateLogin(
  tempToken: string,
  email: string,
  password: string,
): Promise<ValidateLoginResponse> {
  const res = await apiClient("/auth/validate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
    body: JSON.stringify({
      fields: { email, password },
    }),
  }); 

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Error al validar login (${res.status})`);
  }

  const data = (await res.json()) as ValidateLoginResponse;
  
  return data;
}

// Refrescar access token usando refresh token
export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  const res = await apiClient("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Error al refrescar token (${res.status})`);
  }

  const data = (await res.json()) as RefreshTokenResponse;

  return data;
}

// Cerrar sesión en backend e invalidar refresh token
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const res = await apiClient("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Error al cerrar sesion (${res.status})`);
  }
}

// Obtener perfil del usuario autenticado
export async function getProfile(tokenBack?: string): Promise<UserAuth> {
  const res = tokenBack
    ? await apiClient("/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenBack}`,
        },
      })
    : await apiClientSession("/users/profile", {
        method: "GET",
      });

  if (res.status === 401) {
    throw new Error("No autenticado. Inicia sesión.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Error al obtener perfil (${res.status})`);
  }

  const data = await res.json().catch(() => ({}));

  // Support common API wrappers: {data}, {result}, or direct payload.
  const payload =
    (data as any)?.data ||
    (data as any)?.result ||
    data;

  return payload as UserAuth;
}
