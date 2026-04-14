import { propertiesList } from "@/app/types/definitions";
export interface UserRoles {
  roles: string[];
}

export interface AssignedRole {
  id: string;
  role_id: string;
}

export interface UserRolesAssignData {
  user_id: string;
  assigned: AssignedRole[];
  roles_assigned: number;
  roles_already_existed: number;
  total_roles: number;
}

export interface responseUserRolesAssign {
  status: string;
  message: string;
  data: UserRolesAssignData;
}

export interface responseUserRoles {
  status: string;
  message: string;
  data: UserRoles;
}
