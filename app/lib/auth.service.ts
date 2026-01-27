import { apiClient } from './apiClient';
import { User, SelectProviderResponse, ValidateLoginResponse } from './definitions';

// Seleccionar proveedor de autenticación
export async function selectProvider(providerName: string) {
  // Llamada al backend para seleccionar el proveedor de autenticación
  const res = await apiClient('/api/auth/select', {
    method: 'POST',
    body: JSON.stringify({ providerName }),
  });

  // Validación de la respuesta HTTP
  if (!res.ok) {
    // Lectura del mensaje de error del backend (si existe)
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.message || `Error al seleccionar proveedor (${res.status})`
    );
  }

  // Retorna la respuesta del backend (token temporal)
  return res.json() as Promise<SelectProviderResponse>;
}
// Validar login
export async function validateLogin(
  tempToken: string,
  email: string,
  password: string
): Promise<ValidateLoginResponse> {
  const res = await apiClient('/api/auth/validate', {
    method: 'POST',
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

  // Ya no es necesario guardar el token en localStorage, se guarda en cookie httpOnly desde el backend

  return data;
}
// Obtener perfil del usuario autenticado
export async function getProfile(): Promise<User> {
  // Usa el endpoint proxy correcto
  const res = await apiClient('/api/auth/profile');

  // Si el token no es válido o falta, muestra el error
  if (res.status === 401) {
    throw new Error('No autenticado. Inicia sesión.');
  }

  const data = await res.json();
  // Si la respuesta tiene status y message, devuélvelos
  if (data.status && data.message && data.data) {
    return data.data as User;
  }
  // Si no, devuelve el resultado plano (asumiendo que es User)
  return data as User;
}
