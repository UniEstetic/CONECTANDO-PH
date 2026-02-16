import { propertiesList } from "@/app/types/definitions";
export interface AssemblyAnnouncements {
  id?: string;
  title: string;
  message: string;
  is_sticky: boolean;
  created_at: string;
}

export interface responseAssemblyAnnouncements {
  status: string;
  message: string;
  data: AssemblyAnnouncements;
}

export interface responseListAssemblyAnnouncements {
  status: string;
  message: string;
  data: AssemblyAnnouncements[];
  properties: propertiesList;
}
