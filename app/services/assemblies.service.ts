'use server';

import { apiClientSession } from '../utils/apiClient';
import { Assembly, responseAssembly, responseListAssembly } from '../../types/assemblies';
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