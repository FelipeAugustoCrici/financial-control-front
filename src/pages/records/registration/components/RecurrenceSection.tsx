import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

export function RecurrenceSection() {
  const { register } = useFormContext();
  const isRecurring = useWatch({ name: 'isRecurring' });

  return (
    <div className="space-y-4 pt-4 border-t">
      <label className="flex items-center gap-3">
        <input type="checkbox" {...register('isRecurring')} />
        <span className="font-semibold">Lançamento recorrente</span>
      </label>

      {isRecurring && (
        <Input label="Duração (meses)" type="number" {...register('durationMonths')} />
      )}
    </div>
  );
}
