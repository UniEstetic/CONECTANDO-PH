import { propertiesList } from "@/app/types/definitions";
export interface QuestionOptions {
  id?: string;
  question_id: string;
  option_text: string;
  order_index: number;
  is_active: boolean;
}

export interface responseQuestionOptions {
  status: string;
  message: string;
  data: QuestionOptions;
}

export interface responseListQuestionOptions {
  status: string;
  message: string;
  data: QuestionOptions[];
  properties: propertiesList;
}
