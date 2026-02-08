'use server';

import { apiClientSession } from '../utils/apiClient';
import { Assembly, responseAssembly, responseListAssembly } from '../definitions/assemblies';
import {removeRegister} from "@/app/lib/definitions/definitions";

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
export async function getAll(): Promise<responseListAssembly> {
  const res = await apiClientSession('/assemblies');
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