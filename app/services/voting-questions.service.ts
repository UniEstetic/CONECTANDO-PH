'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { VotingQuestions, responseListVotingQuestions, responseVotingQuestions } from '@/app/types/voting-questions';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseVotingQuestions> {
  const res = await apiClientSession(`/voting-questions/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseVotingQuestions>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/voting-questions/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
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
    throw new Error('Error al obtener registro.');
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
    throw new Error('Error al crear registro');
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
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseVotingQuestions>;
}