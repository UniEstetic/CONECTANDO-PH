'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { AssemblyAttendances, responseAssemblyAttendances, responseListAssemblyAttendances } from '@/app/types/assembly-attendances';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseAssemblyAttendances> {
  const res = await apiClientSession(`/assembly-attendances/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseAssemblyAttendances>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/assembly-attendances/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll({fields="*", where="", limit="100", page="1"} : listFilters = {}): Promise<responseListAssemblyAttendances> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });
  
  const res = await apiClientSession(`/assembly-attendances?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListAssemblyAttendances>;
}

// Crear
export async function create(payload: Partial<AssemblyAttendances>): Promise<responseAssemblyAttendances> {
  const res = await apiClientSession('/assembly-attendances', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responseAssemblyAttendances>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<AssemblyAttendances>
): Promise<responseAssemblyAttendances> {
  const res = await apiClientSession(`/assembly-attendances/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseAssemblyAttendances>;
}