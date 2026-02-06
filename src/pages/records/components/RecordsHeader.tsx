import { Button } from '@/components/ui/Button';

export function RecordsHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex justify-between">
      <div>
        <h2 className="text-2xl font-bold">Lançamentos</h2>
        <p className="text-primary-500">Histórico financeiro completo</p>
      </div>
      <Button onClick={onCreate}>Novo Lançamento</Button>
    </div>
  );
}
