import { useFormContext } from 'react-hook-form';

const TYPES = [
  { id: 'expense', label: 'Despesa', color: 'danger' },
  { id: 'salary', label: 'Salário', color: 'primary' },
  { id: 'income', label: 'Extra / Bônus', color: 'success' },
];

export function RecordTypeSelector() {
  const { register } = useFormContext();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {TYPES.map((type) => (
        <label key={type.id} className="cursor-pointer">
          <input type="radio" {...register('type')} value={type.id} className="hidden peer" />
          <div className="p-3 border-2 rounded-xl text-center font-semibold peer-checked:border-primary-600 peer-checked:bg-primary-50">
            {type.label}
          </div>
        </label>
      ))}
    </div>
  );
}
