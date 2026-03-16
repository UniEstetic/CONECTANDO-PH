'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { Assembly, responseAssembly, responseListAssembly } from '@/app/types/assemblies';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseAssembly> {
  const res = await apiClientSession(`/assemblies/${id}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseAssembly>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/assemblies/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Error al eliminar registro.');
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll({fields="*", where="", limit="100", page="1"} : listFilters = {}): Promise<responseListAssembly> {
  const queryParams = new URLSearchParams({
    _fields: fields,
    _where: where,
    limit: limit,
    page: page
  });

  const res = await apiClientSession(`/assemblies?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro.');
  }
  return res.json() as Promise<responseListAssembly>;
}

// Crear
export async function create(payload: Partial<Assembly>): Promise<responseAssembly> {
  const res = await apiClientSession('/assemblies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responseAssembly>;
}

// Actualizar
export async function update(
  id: string,
  payload: Partial<Assembly>
): Promise<responseAssembly> {
  const res = await apiClientSession(`/assemblies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al actualizar registro');
  }
  return res.json() as Promise<responseAssembly>;
}

// Obtener detalles de asamblea por nombre de sala LiveKit
export async function getByLivekitRoom(roomName: string): Promise<responseAssembly> {
  const res = await apiClientSession(`/assemblies/livekit/${roomName}`);
  if (!res.ok) {
    throw new Error('Error al obtener asamblea por sala LiveKit');
  }
  return res.json() as Promise<responseAssembly>;
}

// Listar asambleas por PH
export async function getByPh(phsId: string): Promise<responseListAssembly> {
  const res = await apiClientSession(`/assemblies/ph/${phsId}`);
  if (!res.ok) {
    throw new Error('Error al obtener asambleas por PH');
  }
  return res.json() as Promise<responseListAssembly>;
}