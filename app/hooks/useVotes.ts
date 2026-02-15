import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createVote, getVotes, deleteVote, CreateVoteDto } from '@/app/lib/services/votes.service';

export function useVotes(where?: string) {
  return useQuery({
    queryKey: ['votes', where],
    queryFn: () => getVotes(where),
  });
}

export function useCreateVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: CreateVoteDto) => createVote(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}

export function useDeleteVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteVote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}