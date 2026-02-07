import { propertiesList } from "@/app/lib/definitions/definitions";
export interface UnitAssignments {
  units: string[];
}

export interface responseUnitAssignments {
  status: string;
  message: string;
  data: UnitAssignments;
}

