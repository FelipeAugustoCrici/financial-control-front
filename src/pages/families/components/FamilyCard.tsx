import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, UserPlus } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { createMemberSchema, type CreateMemberFormData } from '../schemas/family.schema';
import type { Family } from '../types/family.types';

interface FamilyCardProps {
  family: Family;
  isCreatingMember: boolean;
  onCreateMember: (familyId: string, data: CreateMemberFormData) => void;
}

export function FamilyCard({ family, isCreatingMember, onCreateMember }: FamilyCardProps) {
  const memberForm = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: { name: '' },
  });

  function handleSubmit(data: CreateMemberFormData) {
    onCreateMember(family.id, data);
    memberForm.reset();
  }

  return (
    <Card>
      <div className="p-5 border rounded-2xl bg-white">
        <div className="flex justify-between mb-4 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-bold">{family.name}</h3>
          </div>
          <span className="text-xs font-semibold">{family.members.length} membros</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-wrap gap-2">
            {family.members.map((member) => (
              <span
                key={member.id}
                className="px-3 py-1.5 rounded-lg bg-success-50 text-success-700 text-sm"
              >
                {member.name}
              </span>
            ))}
          </div>

          <FormProvider {...memberForm}>
            <form onSubmit={memberForm.handleSubmit(handleSubmit)} className="flex gap-2">
              <Input
                placeholder="Nome do membro"
                {...memberForm.register('name')}
                error={memberForm.formState.errors.name?.message}
              />
              <Button variant="secondary" size="sm" type="submit" disabled={isCreatingMember}>
                <UserPlus size={16} />
              </Button>
            </form>
          </FormProvider>
        </div>
      </div>
    </Card>
  );
}
