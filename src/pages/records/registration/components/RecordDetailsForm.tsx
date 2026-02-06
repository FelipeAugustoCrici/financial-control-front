import { useFormContext, useWatch } from 'react-hook-form';
import { Input, Select } from '@/components/ui/Input';
import { FileText } from 'lucide-react';
import _ from 'lodash';

export function RecordDetailsForm({ categories }: { categories: any[] }) {
  const { register, setValue, formState } = useFormContext();
  const type = useWatch({ name: 'type' });

  return (
    <div className="space-y-4">
      <Input
        label="Descrição"
        {...register('description')}
        error={formState.errors.description?.message}
        icon={<FileText size={18} />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Valor"
          type="number"
          step="0.01"
          {...register('value')}
          error={formState.errors.value?.message}
        />

        {type === 'expense' && (
          <Select
            label="Categoria"
            {...register('categoryId')}
            options={[
              { value: '', label: 'Selecione' },
              ...categories
                .filter((c) => c.type === 'expense')
                .map((c) => ({ value: c.id, label: c.name })),
            ]}
            onChange={(e) => {
              const selected = _.find(categories, { id: e.target.value });
              setValue('categoryName', selected?.name || 'outros');
            }}
          />
        )}
      </div>

      <Input
        label="Data"
        type="date"
        {...register('date')}
        error={formState.errors.date?.message}
      />
    </div>
  );
}
