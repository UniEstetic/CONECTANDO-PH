import { propertiesList } from "@/app/lib/definitions/definitions";
export interface UserRoles {
  roles: string[];
}

export interface responseUserRoles {
  status: string;
  message: string;
  data: UserRoles;
}
