'use server';

import { apiClientSession } from '../utils/apiClient';
import { Votes, responseListVotes, responseVotes } from '../definitions/votes';
import { listFilters} from "@/app/lib/definitions/definitions";

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
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListVotes>;
}

// Crear
export async function create(payload: Votes): Promise<responseVotes> {
  const res = await apiClientSession('/votes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
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
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseVotes>;
}