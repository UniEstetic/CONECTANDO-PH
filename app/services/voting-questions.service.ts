'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { VotingQuestions, responseListVotingQuestions, responseVotingQuestions } from '@/app/types/voting-questions';
import { extractErrorMessage } from '@/app/services/_shared/http-errors';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseVotingQuestions> {
  const res = await apiClientSession(`/voting-questions/${id}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro por ID'));
  }
  return res.json() as Promise<responseVotingQuestions>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/voting-questions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar registro.'));
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll({fields="*", where="", limit="100", page="1"} : listFilters = {}): Promise<responseListVotingQuestions> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });

  const res = await apiClientSession(`/voting-questions?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro.'));
  }
  return res.json() as Promise<responseListVotingQuestions>;
}

// Crear
export async function create(payload: VotingQuestions): Promise<responseVotingQuestions> {
  const res = await apiClientSession('/voting-questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al crear registro'));
  }
  return res.json() as Promise<responseVotingQuestions>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<VotingQuestions>
): Promise<responseVotingQuestions> {
  const res = await apiClientSession(`/voting-questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al actualizar registro'));
  }
  return res.json() as Promise<responseVotingQuestions>;
}

// Obtener preguntas de votación por ID de asamblea
export async function getByAssembly(assemblyId: string): Promise<responseListVotingQuestions> {
  const res = await apiClientSession(`/voting-questions/assembly/${assemblyId}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener preguntas de votación'));
  }
  return res.json() as Promise<responseListVotingQuestions>;
}

// Abrir votación (solo admin)
export async function openVotingQuestion(
  id: string,
  statusMessage?: string
): Promise<responseVotingQuestions> {
  const res = await apiClientSession(`/voting-questions/${id}/open`, {
    method: 'PATCH',
    body: JSON.stringify(statusMessage ? { statusMessage } : {}),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al abrir la votación'));
  }
  return res.json() as Promise<responseVotingQuestions>;
}

// Cerrar votación (solo admin)
export async function closeVotingQuestion(
  id: string,
  statusMessage?: string
): Promise<responseVotingQuestions> {
  const res = await apiClientSession(`/voting-questions/${id}/close`, {
    method: 'PATCH',
    body: JSON.stringify(statusMessage ? { statusMessage } : {}),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al cerrar la votación'));
  }
  return res.json() as Promise<responseVotingQuestions>;
}

// Cambiar estado manual (solo admin)
export async function setVotingQuestionStatus(
  id: string,
  status: 'PENDING' | 'OPEN' | 'CLOSED',
  statusMessage?: string
): Promise<responseVotingQuestions> {
  const res = await apiClientSession(`/voting-questions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(statusMessage ? { statusMessage } : {}) }),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al cambiar estado de la votación'));
  }
  return res.json() as Promise<responseVotingQuestions>;
}