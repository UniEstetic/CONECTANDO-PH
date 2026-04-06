'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { QuestionOptions, responseListQuestionOptions, responseQuestionOptions } from '@/app/types/question-options';
import { extractErrorMessage } from '@/app/services/_shared/http-errors';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseQuestionOptions> {
  const res = await apiClientSession(`/question-options/${id}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro por ID'));
  }
  return res.json() as Promise<responseQuestionOptions>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/question-options/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar registro.'));
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll({fields="*", where="", limit="100", page="1"} : listFilters = {}): Promise<responseListQuestionOptions> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });

  const res = await apiClientSession(`/question-options?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro.'));
  }
  return res.json() as Promise<responseListQuestionOptions>;
}

// Crear
export async function create(payload: Partial<QuestionOptions>): Promise<responseQuestionOptions> {
  const res = await apiClientSession('/question-options', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al crear registro'));
  }
  return res.json() as Promise<responseQuestionOptions>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<QuestionOptions>
): Promise<responseQuestionOptions> {
  const res = await apiClientSession(`/question-options/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al actualizar registro'));
  }
  return res.json() as Promise<responseQuestionOptions>;
}

// Obtener opciones por ID de pregunta de votación
export async function getByVotingQuestion(votingQuestionId: string): Promise<responseListQuestionOptions> {
  const res = await apiClientSession(`/question-options/voting-question/${votingQuestionId}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener opciones de votación'));
  }
  return res.json() as Promise<responseListQuestionOptions>;
}