import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { UnifiedRecord } from '../types/record.types';

export function RecordsRow({
  record,
  onEdit,
  onDelete,
}: {
  record: UnifiedRecord;
  onEdit: (r: UnifiedRecord) => void;
  onDelete: (r: UnifiedRecord) => void;
}) {
  return (
    <tr className="hover:bg-primary-50">
      <td>{record.description}</td>
      <td>{record.category?.name || record.categoryName || 'Geral'}</td>
      <td>{new Date(record.date).toLocaleDateString('pt-BR')}</td>
      <td className={record.type === 'income' ? 'text-success-600' : 'text-danger-600'}>
        {record.type === 'income' ? '+' : '-'} {formatCurrency(record.value)}
      </td>
      <td className="text-right">
        <button onClick={() => onEdit(record)}>
          <Edit2 size={16} />
        </button>
        <button onClick={() => onDelete(record)}>
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}
