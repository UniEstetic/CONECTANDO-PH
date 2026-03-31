'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { Assembly, responseAssembly, responseListAssembly } from '@/app/types/assemblies';
import { extractErrorMessage } from '@/app/services/_shared/http-errors';
import {removeRegister, listFilters} from "@/app/types/definitions";

// Buscar por ID
export async function getById(id: string): Promise<responseAssembly> {
  const res = await apiClientSession(`/assemblies/${id}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro por ID'));
  }
  return res.json() as Promise<responseAssembly>;
}

// Eliminar
export async function remove(id: string): Promise<removeRegister>{
  const res = await apiClientSession(`/assemblies/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar registro'));
  }
  return res.json() as Promise<removeRegister>;
}

// Listar
export async function getAll({fields="*", where="", phs_id="", limit="100", page="1"} : listFilters = {}): Promise<responseListAssembly> {
  const queryParams = new URLSearchParams();

  if (fields) queryParams.set('_fields', fields);
  if (where) queryParams.set('_where', where);
  if (phs_id) queryParams.set('phs_id', phs_id);
  queryParams.set('limit', limit);
  queryParams.set('page', page);

  const res = await apiClientSession(`/assemblies?${queryParams.toString()}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener registro'));
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
    throw new Error(await extractErrorMessage(res, 'Error al crear asamblea'));
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
    throw new Error(await extractErrorMessage(res, 'Error al actualizar registro'));
  }
  return res.json() as Promise<responseAssembly>;
}

// Obtener detalles de asamblea por nombre de sala LiveKit
export async function getByLivekitRoom(roomName: string): Promise<responseAssembly> {
  const res = await apiClientSession(`/assemblies/livekit/${roomName}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener asamblea por sala LiveKit'));
  }
  return res.json() as Promise<responseAssembly>;
}

// Listar asambleas por PH
export async function getByPh(phsId: string): Promise<responseListAssembly> {
  const res = await apiClientSession(`/assemblies/ph/${phsId}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener asambleas por PH'));
  }
  return res.json() as Promise<responseListAssembly>;
}

// ==================== SERVICIOS DE ASISTENCIA ====================

// Obtener usuarios citados (con derecho a voto) para una asamblea
export async function getCited(assemblyId: string): Promise<any> {
  const res = await apiClientSession(`/assemblies/${assemblyId}/citados`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener citados'));
  }
  return res.json() as Promise<any>;
}

// Obtener usuarios que asistieron a la asamblea
export async function getAttendees(assemblyId: string): Promise<any> {
  const res = await apiClientSession(`/assemblies/${assemblyId}/asistentes`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener asistentes'));
  }
  return res.json() as Promise<any>;
}

// Obtener usuarios citados que no asistieron
export async function getAbsences(assemblyId: string): Promise<any> {
  const res = await apiClientSession(`/assemblies/${assemblyId}/ausentes`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener ausentes'));
  }
  return res.json() as Promise<any>;
}

// Obtener la suma de coeficientes de las unidades asistentes
export async function getCoefficient(assemblyId: string): Promise<any> {
  const res = await apiClientSession(`/assemblies/${assemblyId}/coeficiente`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener coeficiente'));
  }
  return res.json() as Promise<any>;
}

// Obtener información del quórum (requerido vs actual)
export async function getQuorum(assemblyId: string): Promise<any> {
  const res = await apiClientSession(`/assemblies/${assemblyId}/quorum`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener quórum'));
  }
  return res.json() as Promise<any>;
}