import { api } from '@/services/api.service';
import type { Category } from '../types/category.types';
import type { CategoryFormData } from '../schemas/category.schema';

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/finance/categories');
  return data;
}

export async function createCategory(payload: CategoryFormData): Promise<Category> {
  const { data } = await api.post('/finance/categories', payload);
  return data;
}
