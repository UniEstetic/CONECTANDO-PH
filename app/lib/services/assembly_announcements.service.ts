'use server';

import { apiClientSession } from '../utils/apiClient';
import { AssemblyAnnouncements, responseAssemblyAnnouncements, responseListAssemblyAnnouncements } from '../definitions/assembly_announcements';
import {removeRegister} from "@/app/lib/definitions/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseAssemblyAnnouncements> {
  const res = await apiClientSession(`/agenda/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseAssemblyAnnouncements>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/assembly_announcements/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll(): Promise<responseListAssemblyAnnouncements> {
  const res = await apiClientSession('/assembly_announcements');
  if (!res.ok) {
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListAssemblyAnnouncements>;
}

// Crear
export async function create(payload: Partial<AssemblyAnnouncements>): Promise<responseAssemblyAnnouncements> {
  const res = await apiClientSession('/assembly_announcements', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responseAssemblyAnnouncements>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<AssemblyAnnouncements>
): Promise<responseAssemblyAnnouncements> {
  const res = await apiClientSession(`/assembly_announcements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseAssemblyAnnouncements>;
}