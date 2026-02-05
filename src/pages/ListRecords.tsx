import React, { useState } from 'react';
import _ from 'lodash';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, cn } from '@/components/ui/Button';
import {
  Search,
  Download,
  Loader2,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { financeService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

export const ListRecords = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const queryClient = useQueryClient();

  const deleteRecordMutation = useMutation({
    mutationFn: ({ type, id }: { type: any; id: string }) => financeService.deleteRecord(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const handleDelete = (tx: any) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      let recordType: 'salary' | 'extra' | 'income' | 'expense' = 'expense';

      if (tx.type === 'income') {
        if (tx.description === 'Salário' || tx.salaryId) recordType = 'salary';
        else if (tx.sourceId || tx.type === 'fixed') recordType = 'income';
        else recordType = 'extra';
      } else {
        recordType = 'expense';
      }

      deleteRecordMutation.mutate({ type: recordType, id: tx.id });
    }
  };

  const { data: families = [], isLoading: isLoadingFamilies } = useQuery({
    queryKey: ['families'],
    queryFn: financeService.getFamilies,
  });

  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses', month, year, families[0]?.id],
    queryFn: () => financeService.getExpenses(month, year, families[0]?.id),
    enabled: families.length > 0,
  });

  const { data: extrasResponse, isLoading: isLoadingExtras } = useQuery({
    queryKey: ['extras', month, year],
    queryFn: () => financeService.getExtras(month, year),
  });

  const { data: incomes = [], isLoading: isLoadingIncomes } = useQuery({
    queryKey: ['incomes', month, year, families[0]?.id],
    queryFn: () => financeService.getIncomes(month, year, families[0]?.id),
    enabled: families.length > 0,
  });

  const extras = extrasResponse?.data || [];
  const loading = isLoadingExpenses || isLoadingExtras || isLoadingFamilies || isLoadingIncomes;

  const allTransactions = _.orderBy(
    [
      ..._.map(extras, (e) => ({ ...e, type: 'income' as const })),
      ..._.map(incomes, (i) => ({ ...i, type: 'income' as const })),
      ..._.map(expenses || [], (e) => ({ ...e, type: 'expense' as const })),
    ],
    [(t) => new Date(t.date).getTime()],
    ['desc'],
  );

  const getPersonName = (personId: string) => {
    for (const family of families) {
      const person = _.find(family.members, { id: personId });
      if (person) return person.name;
    }
    return 'Não identificado';
  };

  const filteredTransactions = _.filter(allTransactions, (tx) =>
    _.includes(tx.description?.toLowerCase(), searchTerm?.toLowerCase()),
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-800">Lançamentos</h2>
          <p className="text-primary-500">Gerencie todo o seu histórico financeiro</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <Download size={18} className="mr-2" /> Exportar
          </Button>
          <Button onClick={() => navigate('/cadastro')}>Novo Lançamento</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-primary-50 flex flex-col md:flex-row gap-4 items-center justify-between bg-primary-50/30">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-primary-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center bg-white border border-primary-200 rounded-lg px-3 py-2 gap-2">
              <Calendar size={16} className="text-primary-400" />
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="text-sm focus:outline-none bg-transparent"
              >
                {_.map(_.range(12), (i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="text-sm focus:outline-none bg-transparent"
              >
                {_.map(_.range(now.getFullYear() - 1, now.getFullYear() + 3), (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-primary-600 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-primary-600 uppercase tracking-wider text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-primary-500 italic">
                      Nenhum lançamento encontrado para este período.
                    </td>
                  </tr>
                ) : (
                  _.map(filteredTransactions, (tx, idx) => (
                    <tr key={idx} className="hover:bg-primary-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'p-2 rounded-lg',
                              tx.type === 'income'
                                ? 'bg-success-50 text-success-600'
                                : 'bg-danger-50 text-danger-600',
                            )}
                          >
                            {tx.type === 'income' ? (
                              <ArrowUpCircle size={18} />
                            ) : (
                              <ArrowDownCircle size={18} />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-primary-800">
                            {tx.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={tx.type === 'income' ? 'success' : 'primary'}>
                          {(tx as any).category?.name || (tx as any).categoryName || 'Geral'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-primary-500">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        {tx.type === 'expense' ? (
                          <Badge variant={(tx as any).recurringId ? 'primary' : 'info'}>
                            {(tx as any).recurringId ? 'Fixo' : 'Variável'}
                          </Badge>
                        ) : (tx as any).type === 'fixed' || (tx as any).sourceId ? (
                          <Badge variant="success">Fixo</Badge>
                        ) : (
                          <span className="text-xs text-primary-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'text-sm font-bold',
                            tx.type === 'income' ? 'text-success-600' : 'text-danger-600',
                          )}
                        >
                          {tx.type === 'expense' ? '- ' : '+ '} {formatCurrency(tx.value)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-primary-600 font-medium">
                            {getPersonName(tx.personId)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate('/cadastro', { state: { editRecord: tx } })}
                            className="p-1.5 text-primary-400 hover:text-primary-700 hover:bg-primary-100 rounded-md transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(tx)}
                            disabled={deleteRecordMutation.isPending}
                            className="p-1.5 text-primary-400 hover:text-danger-600 hover:bg-danger-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            {deleteRecordMutation.isPending ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => navigate('/detalhes', { state: { transaction: tx } })}
                            className="p-1.5 text-primary-400 hover:text-primary-700 hover:bg-primary-100 rounded-md transition-colors"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-primary-50 flex items-center justify-between bg-white">
          <p className="text-sm text-primary-500">
            Total de <span className="font-medium">{filteredTransactions.length}</span> registros
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
