import { propertiesList } from "@/app/types/definitions";
export interface UnitAssignments {
  units: string[];
}

export interface responseUnitAssignments {
  status: string;
  message: string;
  data: UnitAssignments;
}

