'use server';

import { apiClientSession } from '@/app/utils/apiClient';
import { UserRolePhsPayload, responseUserRolePhs } from '@/app/types/user_roles_phs';
import { extractErrorMessage } from './_shared/http-errors';

// Asignar copropiedad(es) a un user_role
export async function assign(userRoleId: string, payload: UserRolePhsPayload): Promise<responseUserRolePhs> {
  const res = await apiClientSession(`/user_roles_phs/assign/${userRoleId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Error al asignar copropiedad al rol'));
  }
  return res.json() as Promise<responseUserRolePhs>;
}
