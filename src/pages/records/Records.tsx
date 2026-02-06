import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useRecordFilters } from './hooks/useRecordFilters';
import { useRecords } from './hooks/useRecords';
import { useDeleteRecord } from './hooks/useDeleteRecord';
import { RecordsTable, RecordsFilters, RecordsHeader } from './components';

export function Records() {
  const navigate = useNavigate();
  const filters = useRecordFilters();
  const deleteRecord = useDeleteRecord();

  const { records, isLoading } = useRecords(filters.month, filters.year);

  const filteredRecords = records.filter((r) =>
    r.description.toLowerCase().includes(filters.search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <RecordsHeader onCreate={() => navigate('/cadastro')} />

      <Card className="overflow-hidden">
        <RecordsFilters
          month={filters.month}
          year={filters.year}
          search={filters.search}
          onMonthChange={filters.setMonth}
          onYearChange={filters.setYear}
          onSearchChange={filters.setSearch}
        />

        <RecordsTable
          records={filteredRecords}
          isLoading={isLoading}
          onEdit={(r) => navigate('/cadastro', { state: { editRecord: r } })}
          onDelete={(r) => deleteRecord.mutate(r)}
        />
      </Card>
    </div>
  );
}
