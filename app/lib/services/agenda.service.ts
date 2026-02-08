'use server';

import { apiClientSession } from '../utils/apiClient';
import { Agenda, responseAgenda, responseListAgenda } from '../definitions/agenda';
import {removeRegister} from "@/app/lib/definitions/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseAgenda> {
  const res = await apiClientSession(`/agenda/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseAgenda>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/agenda/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll(): Promise<responseListAgenda> {
  const res = await apiClientSession('/agenda');
  if (!res.ok) {
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListAgenda>;
}

// Crear
export async function create(payload: Agenda): Promise<responseAgenda> {
  const res = await apiClientSession('/agenda', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responseAgenda>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<Agenda>
): Promise<responseAgenda> {
  const res = await apiClientSession(`/agenda/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseAgenda>;
}