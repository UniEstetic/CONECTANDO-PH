import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createVotingQuestion,
  getVotingQuestions,
  updateVotingQuestion,
  deleteVotingQuestion,
  CreateVotingQuestionDto,
} from '@/lib/api/voting-questions';

// Hook para obtener todas las preguntas
export function useVotingQuestions(where?: string) {
  return useQuery({
    queryKey: ['voting-questions', where],
    queryFn: () => getVotingQuestions(where),
  });
}

// Hook para crear pregunta
export function useCreateVotingQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateVotingQuestionDto) => createVotingQuestion(dto),
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
    mutationFn: ({ id, dto }: { id: string; dto: CreateVotingQuestionDto }) =>
      updateVotingQuestion(id, dto),
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
    mutationFn: (id: string) => deleteVotingQuestion(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['voting-questions'] });
      return response;
    },
  });
}