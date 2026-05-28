import { propertiesList } from "@/app/types/definitions";
export type UserRole =
  | 'ADMIN'
  | 'MODERATOR'
  | 'USER'
  | 'RESIDENT'
  | 'SECURITY_GUARD'
  | 'SUPERVISOR';
export interface Roles {
  id?: string;
  name: UserRole;
  description: string;
  scopes: string;
  is_active: boolean;
  created_at: string;
}

export interface responseRoles {
  status: string;
  message: string;
  data: Roles;
}

export interface responseListRoles {
  status: string;
  message: string;
  data: Roles[];
  properties: propertiesList;
}
