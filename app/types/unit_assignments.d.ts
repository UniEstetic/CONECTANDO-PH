import { propertiesList } from "@/app/types/definitions";
export interface UnitAssignments {
  user_id: string;
  units_id: string;
  can_vote: boolean;
}

export interface responseUnitAssignments {
  status: string;
  message: string;
  data: UnitAssignments;
}

