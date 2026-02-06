import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/categories.service';
import { categoryQueryKeys } from '../query-keys';

export function useCategories() {
  return useQuery({
    queryKey: categoryQueryKeys.all,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });
}
