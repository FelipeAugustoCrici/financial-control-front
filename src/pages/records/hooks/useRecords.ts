import { useQuery } from '@tanstack/react-query';
import { financeService } from '@/services/api';
import { normalizeRecords } from '../utils/normalize-records';

export function useRecords(month: number, year: number, familyId?: string) {
  const expenses = useQuery({
    queryKey: ['expenses', month, year, familyId],
    queryFn: () => financeService.getExpenses(month, year, familyId!),
    enabled: !!familyId,
  });

  const incomes = useQuery({
    queryKey: ['incomes', month, year, familyId],
    queryFn: () => financeService.getIncomes(month, year, familyId!),
    enabled: !!familyId,
  });

  const extras = useQuery({
    queryKey: ['extras', month, year],
    queryFn: () => financeService.getExtras(month, year),
  });

  const records = normalizeRecords(
    expenses.data || [],
    incomes.data || [],
    extras.data?.data || [],
  );

  const isLoading = expenses.isLoading || incomes.isLoading || extras.isLoading;

  return { records, isLoading };
}
