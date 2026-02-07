import { propertiesList } from "@/app/lib/definitions/definitions";
export interface AssemblyAttendances {
  id?: string;
  assemblies_id: string;
  unit_assignments_id: string;
  arrival_at: string;
  is_present: boolean;
  proxy_file_id: string;
  notes: string;
}

export interface responseCreateAssemblyAttendances {
  status: string;
  message: string;
  data: AssemblyAttendances;
}

export interface responseListAssemblyAttendances {
  status: string;
  message: string;
  data: AssemblyAttendances[];
  properties: propertiesList;
}
