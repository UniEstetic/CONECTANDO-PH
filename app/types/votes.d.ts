import { propertiesList } from "@/app/types/definitions";
export interface Votes {
  id?: string;
  voting_questions_id: string;
  questions_options_id: string;
  coefficient_at_voting: number;
  created_at: string;
}

export interface responseVotes {
  status: string;
  message: string;
  data: Votes;
}

export interface responseListVotes {
  status: string;
  message: string;
  data: Votes[];
  properties: propertiesList;
}
