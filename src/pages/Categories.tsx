import React, { useState } from 'react';
import _ from 'lodash';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Tags, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { financeService } from '@/services/api';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['expense', 'income']),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export const Categories = () => {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: financeService.getCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => financeService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: () => setError('Erro ao criar categoria'),
  });

  const onSubmit = (data: CategoryFormData) => {
    setError(null);
    createCategoryMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-800">Categorias</h2>
          <p className="text-primary-500">Gerencie as categorias de gastos e receitas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card title="Nova Categoria">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nome da Categoria"
                  placeholder="Ex: Alimentação, Lazer..."
                  {...register('name')}
                  error={errors.name?.message}
                />
                <Select
                  label="Tipo"
                  {...register('type')}
                  error={errors.type?.message}
                  options={[
                    { value: 'expense', label: 'Despesa' },
                    { value: 'income', label: 'Receita' },
                  ]}
                />
                <Button type="submit" className="w-full" disabled={createCategoryMutation.isPending}>
                  {createCategoryMutation.isPending ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Plus size={18} className="mr-2" />
                  )}
                  Criar Categoria
                </Button>

                {success && (
                  <div className="flex items-center gap-2 text-success-600 text-sm animate-in fade-in">
                    <CheckCircle2 size={16} />
                    Categoria criada com sucesso!
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 text-danger-600 text-sm animate-in fade-in">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </form>
            </FormProvider>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card title="Categorias Existentes">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-primary-400 italic">
                Nenhuma categoria cadastrada.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {_.map(categories, (cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 border border-primary-100 rounded-xl bg-primary-50/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cat.type === 'income' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}>
                        <Tags size={18} />
                      </div>
                      <span className="font-semibold text-primary-800">{cat.name}</span>
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${cat.type === 'income' ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
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
};