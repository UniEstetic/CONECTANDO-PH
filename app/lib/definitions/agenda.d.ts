import {propertiesList} from "@/app/lib/definitions/definitions"
export interface Agenda {
  id?: string;
  assembly_id: string;
  title: string;
  sort_order: number;
  is_votable: boolean;
  required_quorum: number;
  is_active: boolean;
  created_at: string;
}

export interface responseAgenda {
  status: string;
  message: string;
  data: Agenda;
}

export interface responseListAgenda {
  status: string;
  message: string;
  data: Agenda[];
  properties: propertiesList;
}
