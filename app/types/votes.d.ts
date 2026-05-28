import { propertiesList } from "@/app/types/definitions";
export interface Votes {
  id?: string;
  voting_questions_id: string;
  questions_options_id: string;
  assembly_attendances_id: string;
  coefficient_at_voting: number;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface VoteCreatePayload {
  voting_questions_id: string;
  questions_options_id: string;
  assembly_attendances_id: string;
  coefficient_at_voting: number;
  ip_address?: string;
  user_agent?: string;
}

export interface VoteResultOption {
  option_id: string;
  option_text: string;
  votes_count: number;
  percentage: number;
  coefficient_total: number;
}

export interface VoteResults {
  question_id: string;
  question_text: string;
  total_votes: number;
  options: VoteResultOption[];
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

export interface responseVoteResults {
  status: string;
  message: string;
  data: VoteResults;
}
