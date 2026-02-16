'use server';

import { apiClientSession } from '../utils/apiClient';
import { UnitAssignments, responseUnitAssignments } from '../../types/unit_assignments';

// Buscar por ID
export async function getById(userRolId: string): Promise<responseUnitAssignments> {
  const res = await apiClientSession(`/unit_assignments/${userRolId}`);
  if (!res.ok) {
    throw new Error('Error al obtener registro por ID');
  }
  return res.json() as Promise<responseUnitAssignments>;
}

// Crear
export async function assign(userRolId: string, payload: Partial<UnitAssignments>): Promise<responseUnitAssignments> {
  const res = await apiClientSession(`/unit_assignments/assing/${userRolId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Error al crear registro');
  }
  return res.json() as Promise<responseUnitAssignments>;
}