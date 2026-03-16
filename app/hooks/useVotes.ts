import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { create, getAll, update } from '@/app/services/votes.service';
import { Votes } from '@/app/types/votes';

export function useVotes(where?: string) {
  return useQuery({
    queryKey: ['votes', where],
    queryFn: () => getAll({ where }),
  });
}

export function useCreateVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (dto: Votes) => create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}

export function useUpdateVote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Votes> }) => update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });
}