import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  create,
  getAll,
  update,
  remove,
} from '@/app/services/voting-questions.service';
import { VotingQuestions } from '@/app/types/voting-questions';

// Hook para obtener todas las preguntas
export function useVotingQuestions(where?: string) {
  return useQuery({
    queryKey: ['voting-questions', where],
    queryFn: () => getAll({ where }),
  });
}

// Hook para crear pregunta
export function useCreateVotingQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: VotingQuestions) => create(dto),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['voting-questions'] });
      return response;
    },
  });
}

// Hook para actualizar pregunta
export function useUpdateVotingQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VotingQuestions> }) =>
      update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['voting-questions'] });
      return response;
    },
  });
}

// Hook para eliminar pregunta
export function useDeleteVotingQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => remove(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['voting-questions'] });
      return response;
    },
  });
}