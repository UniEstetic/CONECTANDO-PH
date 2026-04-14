'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { UserRoles, responseUserRoles, responseUserRolesAssign } from '@/app/types/user_roles';
import { extractErrorMessage } from './_shared/http-errors';

// Asignar rol a usuario
export async function assign(userId: string, payload: UserRoles): Promise<responseUserRolesAssign> {
  console.log('[DEBUG SERVER] /user_roles/assing/ - userId:', userId, '- payload:', JSON.stringify(payload));
  const res = await apiClientSession(`/user_roles/assing/${userId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al asignar roles'));
  }
  return res.json() as Promise<responseUserRolesAssign>;
}

// Eliminar rol de usuario por id de relación
export async function removeRole(relationId: string): Promise<void> {
  const res = await apiClientSession(`/user_roles/${relationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar rol'));
  }
}

// Obtener roles de usuario
export async function getById(userId: string): Promise<responseUserRoles> {
  const res = await apiClientSession(`/user_roles/${userId}`);
  if (res.status === 404 || res.status === 204) {
    return {
      status: 'success',
      message: 'Usuario sin roles asignados',
      data: { roles: [] },
    } as responseUserRoles;
  }
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener roles del usuario'));
  }
  const text = await res.text();
  if (!text) {
    return {
      status: 'success',
      message: 'Usuario sin roles asignados',
      data: { roles: [] },
    } as responseUserRoles;
  }
  return JSON.parse(text) as responseUserRoles;
}
