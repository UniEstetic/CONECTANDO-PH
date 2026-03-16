'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { Units, responseListUnits, responseUnits } from '@/app/types/units';
import {removeRegister, listFilters} from "@/app/types/definitions";

type UnitMutationPayload = Omit<Partial<Units>, 'coefficient' | 'floor' | 'area'> & {
  coefficient?: number | string;
  floor?: number | string;
  area?: number | string;
};

async function extractErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    const message = data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  } catch {
    // Ignorar parseo y usar fallback
  }

  return fallback;
}

// Buscar por ID
export async function getById(phId: string, id: string): Promise<responseUnits> {
  const res = await apiClientSession(`/units/get/${phId}/${id}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro por ID'));
  }
  return res.json() as Promise<responseUnits>;
}

// Eliminar
export async function remove(phId: string, id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/units/${phId}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar registro.'));
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
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro.'));
  }
  return res.json() as Promise<responseListUnits>;
}

// Crear
export async function create(phId: string, payload: UnitMutationPayload): Promise<responseUnits> {
  const res = await apiClientSession(`/units/register/${phId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al crear registro'));
  }
  return res.json() as Promise<responseUnits>;
}

// Actualizar
export async function update(
  phId: string,
  id: string,
  payload: UnitMutationPayload
): Promise<responseUnits> {
  const res = await apiClientSession(`/units/${phId}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al actualizar registro'));
  }
  return res.json() as Promise<responseUnits>;
}