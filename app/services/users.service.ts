'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { User, responseListUsers, responseUsers } from '@/app/types/users';
import {removeRegister, listFilters} from "@/app/types/definitions";
import { extractErrorMessage } from '@/app/services/_shared/http-errors';

// Buscar usuario por ID
export async function getById(id: string): Promise<responseUsers> {
  const res = await apiClientSession(`/users/${id}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener usuario por ID'));
  }
  return res.json() as Promise<responseUsers>;
}

// Eliminar usuario
export async function remove(id: string): Promise<removeRegister> {
  const res = await apiClientSession(`/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar usuario'));
  }
  return res.json() as Promise<removeRegister>;
}

// Listar usuarios
export async function getAll({fields="*", where="", limit="100", page="1", phs_id=""} : listFilters = {}): Promise<responseListUsers> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });

  if (phs_id) {
    queryParams.set('phId', phs_id);
  }

  const res = await apiClientSession(`/users?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener usuarios'));
  }
  return res.json() as Promise<responseListUsers>;
}

// Crear usuario
export async function create(payload: Partial<User>): Promise<responseUsers> {
  const res = await apiClientSession('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al crear usuario'));
  }
  return res.json() as Promise<responseUsers>;
}

// Actualizar usuario
export async function update(
  id: string,
  payload: Partial<User>
): Promise<responseUsers> {
  const res = await apiClientSession(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al actualizar usuario'));
  }
  return res.json() as Promise<responseUsers>;
}

// Buscar usuario por email
export async function getByEmail(email: string): Promise<responseUsers> {
  const res = await apiClientSession(`/users/email/${email}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener usuario por email'));
  }
  return res.json() as Promise<responseUsers>;
}
