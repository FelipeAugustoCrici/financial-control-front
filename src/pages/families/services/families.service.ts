import { api } from '@/services/api.service';
import type { Family } from '../types/family.types';

export async function getFamilies(): Promise<Family[]> {
  const { data } = await api.get('/finance/families');
  return data;
}

export async function createFamily(name: string): Promise<Family> {
  const { data } = await api.post('/finance/families', { name });
  return data;
}

export async function createMember(name: string, familyId: string): Promise<void> {
  await api.post('/finance/persons', {
    name,
    familyId,
  });
}
