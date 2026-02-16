import { propertiesList } from "@/app/types/definitions";
export interface Phs {
  id?: string;
  name: string;
  tax_id: string;
  address: string;
  phone_number: string;
  email: string;
  logo_url: string;
  legal_representative: string;
  city: string;
  state: string;
  country: string;
  stratum: string;
  number_of_towers: string;
  amount_of_real_estate: string;
  horizontal_property_regulations: string;
  is_active: boolean;
  created_by: string;
}

export interface responsePhs {
  status: string;
  message: string;
  data: Phs;
}

export interface responseListPhs {
  status: string;
  message: string;
  data: Phs[];
  properties: propertiesList;
}
