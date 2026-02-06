import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFamily } from '../services/families.service';
import { familyQueryKeys } from '../query-keys';
import { useToast } from '@/hooks/useToast';

export function useCreateFamily() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: createFamily,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: familyQueryKeys.all,
      });

      showToast({
        title: 'Família criada',
        description: 'Família cadastrada com sucesso.',
        variant: 'success',
      });
    },

    onError: () => {
      showToast({
        title: 'Erro ao criar família',
        description: 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    },
  });
}
