import { useFormContext, useWatch } from 'react-hook-form';
import { Select } from '@/components/ui/Input';
import _ from 'lodash';

export function FamilySelector({ families }: { families: any[] }) {
  const { register, setValue } = useFormContext();
  const familyId = useWatch({ name: 'familyId' });

  const family = _.find(families, { id: familyId });
  const people = family?.members || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label="Família"
        {...register('familyId')}
        options={families.map((f) => ({ value: f.id, label: f.name }))}
      />

      <Select
        label="Responsável"
        {...register('personId')}
        options={people.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
        onChange={(e) => setValue('personId', e.target.value)}
      />
    </div>
  );
}
