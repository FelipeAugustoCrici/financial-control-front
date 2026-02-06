import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { useFamilies } from './hooks/useFamilies';
import { useCreateFamily } from './hooks/useCreateFamily';
import { useCreateMember } from './hooks/useCreateMember';

import { createFamilySchema, type CreateFamilyFormData } from './schemas/family.schema';

import { FamilyCard } from './components/FamilyCard';

export function Families() {
  const { data: families = [], isLoading } = useFamilies();
  const createFamily = useCreateFamily();
  const createMember = useCreateMember();

  const familyForm = useForm<CreateFamilyFormData>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: { name: '' },
  });

  function onCreateFamily(data: CreateFamilyFormData) {
    createFamily.mutate(data.name, {
      onSuccess: () => familyForm.reset(),
    });
  }

  function handleCreateMember(familyId: string, data: any) {
    createMember.mutate({ familyId, name: data.name });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciamento de Famílias</h2>
        <p className="text-primary-500">Cadastre famílias e seus respectivos membros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Nova Família">
          <FormProvider {...familyForm}>
            <form onSubmit={familyForm.handleSubmit(onCreateFamily)} className="space-y-4">
              <Input
                label="Nome da Família"
                {...familyForm.register('name')}
                error={familyForm.formState.errors.name?.message}
              />

              <Button type="submit" className="w-full" disabled={createFamily.isPending}>
                {createFamily.isPending ? (
                  <Loader2 className="mr-2 animate-spin" size={18} />
                ) : (
                  <Plus className="mr-2" size={18} />
                )}
                Criar Família
              </Button>
            </form>
          </FormProvider>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            families.map((family) => (
              <FamilyCard
                key={family.id}
                family={family}
                isCreatingMember={createMember.isPending}
                onCreateMember={handleCreateMember}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
