'use server';

import { apiClientSession } from '../utils/apiClient';
import { QaEntries, responseListQaEntries, responseQaEntries } from '../../types/qa_entries';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseQaEntries> {
  const res = await apiClientSession(`/qa_entries/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseQaEntries>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/qa_entries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll({fields="*", where="", limit="100", page="1"} : listFilters = {}): Promise<responseListQaEntries> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });

  const res = await apiClientSession(`/qa_entries?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListQaEntries>;
}

// Crear
export async function create(payload: Partial<QaEntries>): Promise<responseQaEntries> {
  const res = await apiClientSession('/qa_entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responseQaEntries>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<QaEntries>
): Promise<responseQaEntries> {
  const res = await apiClientSession(`/qa_entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseQaEntries>;
}