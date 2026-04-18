import { AgendaItem } from '@/app/types/agenda';
import { VotingQuestion } from '@/app/types/voting-questions';

export type { Option } from '@/app/types/question-options';
export type { VotingQuestion } from '@/app/types/voting-questions';
export type { AgendaItem } from '@/app/types/agenda';
export type { AssemblyFormData } from '@/app/types/assemblies';

export const EMPTY_CURRENT_ITEM: Partial<AgendaItem> = {
  title: '',
  is_votable: false,
  required_quorum: 50,
  type: 'Texto',
};

export const EMPTY_CURRENT_QUESTION: Partial<VotingQuestion> = {
  question_text: '',
  description: '',
  type: 'simple',
  result_type: 'relative_majority',
  min_selections: 1,
  max_selections: 1,
  options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }, { text: '' }],
};

export const normalizeAgendaSortOrder = (items: AgendaItem[]): AgendaItem[] =>
  items.map((item, index) => ({
    ...item,
    sort_order: index + 1,
  }));
