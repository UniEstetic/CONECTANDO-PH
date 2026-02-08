'use server';

import { apiClientSession } from '../utils/apiClient';
import { Phs, responseListPhs, responsePhs } from '../definitions/phs';
import {removeRegister} from "@/app/lib/definitions/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responsePhs> {
  const res = await apiClientSession(`/phs/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responsePhs>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/phs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll(): Promise<responseListPhs> {
  const res = await apiClientSession('/phs');
  if (!res.ok) {
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListPhs>;
}

// Crear
export async function create(payload: Partial<Phs>): Promise<responsePhs> {
  const res = await apiClientSession('/phs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responsePhs>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<Phs>
): Promise<responsePhs> {
  const res = await apiClientSession(`/phs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responsePhs>;
}