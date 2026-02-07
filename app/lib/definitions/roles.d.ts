import { propertiesList } from "@/app/lib/definitions/definitions";
export interface Roles {
  id?: string;
  name: string;
  description: string;
  scopes: string;
  is_active: boolean;
  created_at: string;
}

export interface responseCreateRoles {
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
