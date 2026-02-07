import { propertiesList } from "@/app/lib/definitions/definitions";
export interface QaEntries {
  id?: string;
  assembly_attendances_id: string;
  question_text: string;
  status: string;
  answer_text: string;
  upvotes: number;
  created_at: string;
}

export interface responseCreateQaEntries {
  status: string;
  message: string;
  data: QaEntries;
}

export interface responseListQaEntries {
  status: string;
  message: string;
  data: QaEntries[];
  properties: propertiesList;
}
