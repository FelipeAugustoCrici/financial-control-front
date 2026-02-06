import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Tags, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { categorySchema, type CategoryFormData } from './schemas/category.schema';
import { useCategories } from './hooks/useCategories';
import { useCreateCategory } from './hooks/useCreateCategory';

export function Categories() {
  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
    },
  });

  const { register, handleSubmit, formState } = methods;

  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();

  function onSubmit(data: CategoryFormData) {
    createCategory.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-800">Categorias</h2>
        <p className="text-primary-500">Gerencie as categorias de gastos e receitas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Nova Categoria">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome da Categoria"
                {...register('name')}
                error={formState.errors.name?.message}
              />

              <Select
                label="Tipo"
                {...register('type')}
                options={[
                  { value: 'expense', label: 'Despesa' },
                  { value: 'income', label: 'Receita' },
                ]}
              />

              <Button type="submit" className="w-full" disabled={createCategory.isPending}>
                {createCategory.isPending ? (
                  <Loader2 className="mr-2 animate-spin" size={18} />
                ) : (
                  <Plus className="mr-2" size={18} />
                )}
                Criar Categoria
              </Button>
            </form>
          </FormProvider>
        </Card>

        <div className="md:col-span-2">
          <Card title="Categorias Existentes">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {_.map(categories, (cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 border rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          cat.type === 'income'
                            ? 'bg-success-50 text-success-600'
                            : 'bg-danger-50 text-danger-600'
                        }`}
                      >
                        <Tags size={18} />
                      </div>
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold uppercase">
                      {cat.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
