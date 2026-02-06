import { Loader2 } from 'lucide-react';
import type { UnifiedRecord } from '../types/record.types';
import { RecordsRow } from './RecordsRow';

type Props = {
  records: UnifiedRecord[];
  isLoading: boolean;
  onEdit: (r: UnifiedRecord) => void;
  onDelete: (r: UnifiedRecord) => void;
};

export function RecordsTable({ records, isLoading, onEdit, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <table className="w-full">
      <tbody>
        {records.map((record) => (
          <RecordsRow key={record.id} record={record} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  );
}
