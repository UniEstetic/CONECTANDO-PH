'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { QaEntries, responseListQaEntries, responseQaEntries } from '@/app/types/qa_entries';
import {removeRegister, listFilters} from "@/app/types/definitions";
import { extractErrorMessage } from '@/app/services/_shared/http-errors';

// Buscar por ID
export async function getById(id: string): Promise<responseQaEntries> {
  const res = await apiClientSession(`/qa_entries/${id}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro por ID'));
  }
  return res.json() as Promise<responseQaEntries>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/qa_entries/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar registro.'));
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
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro.'));
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
    throw new Error(await extractErrorMessage(res, 'Error al crear registro'));
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
    throw new Error(await extractErrorMessage(res, 'Error al actualizar registro'));
  }
  return res.json() as Promise<responseQaEntries>;
}

// Obtener preguntas activas al cargar (para asamblea)
export async function getActiveByAssembly(assemblyId: string): Promise<responseListQaEntries> {
  const res = await apiClientSession(`/qa_entries/assembly/${assemblyId}/active`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener preguntas activas'));
  }
  return res.json() as Promise<responseListQaEntries>;
}

// Obtener preguntas moderadas (para asamblea)
export async function getModeratedByAssembly(assemblyId: string): Promise<responseListQaEntries> {
  const res = await apiClientSession(`/qa_entries/assembly/${assemblyId}/moderated`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener preguntas moderadas'));
  }
  return res.json() as Promise<responseListQaEntries>;
}

// Obtener todas las preguntas por asamblea
export async function getByAssembly(assemblyId: string): Promise<responseListQaEntries> {
  const res = await apiClientSession(`/qa_entries/assembly/${assemblyId}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener preguntas de la asamblea'));
  }
  return res.json() as Promise<responseListQaEntries>;
}

// Votar pregunta
export async function upvote(id: string): Promise<responseQaEntries> {
  const res = await apiClientSession(`/qa_entries/${id}/upvote`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al votar pregunta'));
  }
  return res.json() as Promise<responseQaEntries>;
}