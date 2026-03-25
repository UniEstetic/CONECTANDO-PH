'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { UnitAssignments, responseUnitAssignments } from '@/app/types/unit_assignments';
import { extractErrorMessage } from './_shared/http-errors';

type AssignUnitPayload = Pick<UnitAssignments, 'units_id' | 'can_vote'>

// Buscar por ID
export async function getById(userRolId: string): Promise<responseUnitAssignments> {
  const res = await apiClientSession(`/unit_assignments/${userRolId}`);
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al obtener asignación por ID'));
  }
  return res.json() as Promise<responseUnitAssignments>;
}

// Eliminar asignación de unidad por id de relación
export async function remove(relationId: string): Promise<void> {
  const res = await apiClientSession(`/unit_assignments/${relationId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al eliminar asignación de unidad'));
  }
}

// Crear asignación de unidad
export async function assign(userId: string, payload: AssignUnitPayload): Promise<responseUnitAssignments> {
  const requestBody: UnitAssignments = {
    user_id: userId,
    units_id: payload.units_id,
    can_vote: payload.can_vote,
  }

  const res = await apiClientSession(`/unit_assignments/assign/${userId}`, {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al asignar unidad'));
  }
  return res.json() as Promise<responseUnitAssignments>;
}