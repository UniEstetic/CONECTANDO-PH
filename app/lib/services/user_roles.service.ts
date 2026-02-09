'use server';

import { apiClientSession } from '../utils/apiClient';
import { UserRoles, responseUserRoles } from '../definitions/user_roles';

// Asignar rol a usuario
export async function assign(userId: string, payload: UserRoles): Promise<responseUserRoles> {
  const res = await apiClientSession(`/user_roles/assing/${userId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.json() as Promise<responseUserRoles>;
}

// Obtener roles de usuario
export async function getById(userId: string): Promise<responseUserRoles> {
  const res = await apiClientSession(`/user_roles/${userId}`);
  return res.json() as Promise<responseUserRoles>;
}
