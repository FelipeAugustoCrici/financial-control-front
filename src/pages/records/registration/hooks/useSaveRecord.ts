import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recordsApi } from '@/services';
import { useToast } from '@/hooks/useToast';
import type { RegistrationFormData } from '../schemas/registration.schema';

export function useSaveRecord(editRecord?: { id: string }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const value = Number(data.value);

      if (data.type === 'expense') {
        const payload = {
          description: data.description,
          value,
          categoryName: data.categoryName,
          categoryId: data.categoryId || undefined,
          date: data.date,
          personId: data.personId,
          isRecurring: data.isRecurring,
          durationMonths: data.durationMonths ? Number(data.durationMonths) : undefined,
        };

        return editRecord
          ? recordsApi.updateExpense(editRecord.id, payload)
          : recordsApi.createExpense(payload);
      }

      const incomeType: 'fixed' | 'flex' =
        data.type === 'salary' ? (data.isRecurring ? 'fixed' : 'flex') : 'flex';

      const payload = {
        description: data.description,
        value,
        date: data.date,
        personId: data.personId,
        type: incomeType,
        isRecurring: data.isRecurring,
        durationMonths: data.durationMonths ? Number(data.durationMonths) : undefined,
      };

      return editRecord
        ? recordsApi.updateIncome(editRecord.id, payload)
        : recordsApi.createIncome(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['extras'] });

      showToast({
        title: 'Lançamento salvo',
        description: editRecord
          ? 'O lançamento foi atualizado com sucesso.'
          : 'O lançamento foi criado com sucesso.',
        variant: 'success',
      });
    },

    onError: (error: any) => {
      showToast({
        title: 'Erro ao salvar lançamento',
        description:
          error?.response?.data?.message ||
          'Não foi possível salvar o lançamento. Tente novamente.',
        variant: 'error',
      });
    },
  });
}
