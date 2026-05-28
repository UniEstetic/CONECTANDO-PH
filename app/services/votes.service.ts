'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { VoteCreatePayload, Votes, responseListVotes, responseVoteResults, responseVotes } from '@/app/types/votes';
import { listFilters} from "@/app/types/definitions";
import { extractErrorMessage } from '@/app/services/_shared/http-errors';

// Listar
export async function getAll({fields="*", where="", limit="100", page="1"} : listFilters = {}): Promise<responseListVotes> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });

  const res = await apiClientSession(`/votes?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro.'));
  }
  return res.json() as Promise<responseListVotes>;
}

// Crear
export async function create(payload: VoteCreatePayload): Promise<responseVotes> {
  const res = await apiClientSession('/votes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al crear registro'));
  }
  return res.json() as Promise<responseVotes>;
}

// Actualizar *** PENDIENTE EN EL BACKEND***
export async function update(
  id: string,
  payload: Partial<Votes>
): Promise<responseVotes> {
  const res = await apiClientSession(`/votes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al actualizar registro'));
  }
  return res.json() as Promise<responseVotes>;
}

// Obtener votos por ID de pregunta de votación
export async function getByVotingQuestion(votingQuestionId: string): Promise<responseListVotes> {
  const queryParams = new URLSearchParams({
    _fields: '*',
    _where: JSON.stringify({ voting_questions_id: votingQuestionId }),
  });
  const res = await apiClientSession(`/votes?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener votos de la pregunta'));
  }
  return res.json() as Promise<responseListVotes>;
}

// Obtener resultados agregados por pregunta
export async function getResultsByQuestion(questionId: string): Promise<responseVoteResults> {
  const res = await apiClientSession(`/votes/results/${questionId}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener resultados de la votación'));
  }
  return res.json() as Promise<responseVoteResults>;
}