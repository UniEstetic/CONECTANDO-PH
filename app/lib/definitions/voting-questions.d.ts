import { propertiesList } from "@/app/lib/definitions/definitions";
export interface VotingQuestions {
  id?: string;
  agenda_id: string;
  question_text: string;
  description: string;
  type: string;
  status: string;
  result_type: string;
  min_selections: number;
  max_selections: number;
  opened_at: string;
  closed_at: string;
}

export interface responseVotingQuestions {
  status: string;
  message: string;
  data: VotingQuestions;
}

export interface responseListVotingQuestions {
  status: string;
  message: string;
  data: VotingQuestions[];
  properties: propertiesList;
}
