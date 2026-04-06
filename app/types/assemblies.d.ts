import { propertiesList } from "@/app/types/definitions";
export interface Assembly {
  id?: string;
  phs_id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  scheduled_at: string;
  started_at: string;
  finished_at: string;
  livekit_room_name: string;
  quorum_requirement: number;
  is_active: boolean;
  created_at: string; 
}

export interface responseAssembly {
  status: string;
  message: string;
  data: Assembly;
}

export interface responseListAssembly {
  status: string;
  message: string;
  data: Assembly[];
  properties: propertiesList;
}

export type AssemblyFormData = Partial<Assembly>
