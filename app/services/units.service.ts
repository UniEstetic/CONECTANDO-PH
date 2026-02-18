'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { Units, responseListUnits, responseUnits } from '@/app/types/units';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(phId: string, id: string): Promise<responseUnits> {
  const res = await apiClientSession(`/units/get/${phId}/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseUnits>;
}

// Eliminar
export async function remove(phId: string, id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/units/${phId}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll(phId: string, {fields="*", where="", limit="100", page="1"} : listFilters = {}): Promise<responseListUnits> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });

  const res = await apiClientSession(`/units/list/${phId}?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListUnits>;
}

// Crear
export async function create(phId: string, payload: Partial<Units>): Promise<responseUnits> {
  const res = await apiClientSession(`/units/register/${phId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responseUnits>;
}

// Actualizar
export async function update(
  phId: string,
  id: string,
  payload: Partial<Units>
): Promise<responseUnits> {
  const res = await apiClientSession(`/units/${phId}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseUnits>;
}