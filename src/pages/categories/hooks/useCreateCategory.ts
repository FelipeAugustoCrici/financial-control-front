import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../services/categories.service';
import { categoryQueryKeys } from '../query-keys';
import { useToast } from '@/hooks/useToast';

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: createCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryQueryKeys.all,
      });

      showToast({
        title: 'Categoria criada',
        description: 'A categoria foi cadastrada com sucesso.',
        variant: 'success',
      });
    },

    onError: () => {
      showToast({
        title: 'Erro ao criar categoria',
        description: 'Tente novamente em alguns instantes.',
        variant: 'error',
      });
    },
  });
}
