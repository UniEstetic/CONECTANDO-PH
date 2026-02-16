import { propertiesList } from "@/app/types/definitions";
export interface UserRoles {
  roles: string[];
}

export interface responseUserRoles {
  status: string;
  message: string;
  data: UserRoles;
}
