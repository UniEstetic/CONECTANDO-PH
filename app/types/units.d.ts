import { propertiesList } from "@/app/types/definitions";
export interface Units {
  id?: string;
  block: string;
  unit_number: string;
  type: string;
  coefficient: string;
  floor: string;
  area: string;
  tax_responsible: string;
  tax_responsible_document_type: string;
  tax_responsible_document: string;
  is_active: boolean;
  created_at: string;
}

export interface responseUnits {
  status: string;
  message: string;
  data: Units;
}

export interface responseListUnits {
  status: string;
  message: string;
  data: Units[];
  properties: propertiesList;
}
