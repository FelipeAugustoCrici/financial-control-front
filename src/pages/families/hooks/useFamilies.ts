import { useQuery } from '@tanstack/react-query';
import { getFamilies } from '../services/families.service';
import { familyQueryKeys } from '../query-keys';

export function useFamilies() {
  return useQuery({
    queryKey: familyQueryKeys.all,
    queryFn: getFamilies,
    staleTime: 1000 * 60 * 10,
  });
}
