import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/services/api';
import { resolveDeleteType } from '../utils/resolve-record-type';
import type { UnifiedRecord } from '../types/record.types';

export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (record: UnifiedRecord) =>
      financeService.deleteRecord(resolveDeleteType(record), record.id),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
