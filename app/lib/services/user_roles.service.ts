import { apiClientSession } from '../utils/apiClient';

// Asignar rol a usuario
export async function assignUserRole(userId: string, payload: any) {
  const res = await apiClientSession(`/user_roles/assing/${userId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Obtener roles de usuario
export async function getUserRoles(userId: string) {
  const res = await apiClientSession(`/user_roles/${userId}`);
  return res.json();
}
