'use server';

import { apiClient, apiClientSession } from "@/app/utils/apiClient";
import {
  UserAuth,
  SelectProviderResponse,
  ValidateLoginResponse,
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
// Obtener perfil del usuario autenticado
export async function getProfile(tokenBack?: string): Promise<UserAuth> {
  const res = await apiClientSession("/auth/getProfile", {
    method: "GET",
    headers: tokenBack ? {
      Authorization: `Bearer ${tokenBack}`,
    } : {}
  });

  if (res.status === 401) {
    throw new Error("No autenticado. Inicia sesión.");
  }

  const data = await res.json();

  if (data.status && data.message && data.data) {
    return data.data as UserAuth;
  }

  return data as UserAuth;
}
