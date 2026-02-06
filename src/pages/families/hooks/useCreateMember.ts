import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMember } from '../services/families.service';
import { familyQueryKeys } from '../query-keys';
import { useToast } from '@/hooks/useToast';

type CreateMemberPayload = {
  name: string;
  familyId: string;
};

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ name, familyId }: CreateMemberPayload) => createMember(name, familyId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.all,
      });

      showToast({
        title: 'Membro adicionado',
        description: 'O membro foi adicionado à família.',
        variant: 'success',
      });
    },

    onError: () => {
      showToast({
        title: 'Erro ao adicionar membro',
        description: 'Não foi possível adicionar o membro.',
        variant: 'error',
      });
    },
  });
}
