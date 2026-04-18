import { propertiesList } from "@/app/types/definitions";
export interface User {
  id?: string;
  first_name: string;
  last_name: string;
  password?: string;
  type_person: string;
  gender: string;
  avatar_url: string;
  email: string;
  document_type: string;
  document_number: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

export interface responseUsers {
  status: string;
  message: string;
  data: Users;
}

export interface responseListUsers {
  status: string;
  message: string;
  data: Users[];
  properties: propertiesList;
}

export type UserFormData = Omit<User, 'id' | 'created_at'>

export interface RoleWithUnits {
  roleId: string
  roleName: string
  selectedUnits: string[]
  canVote: boolean
  unitRelationIds?: Record<string, string>
}
