import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button, cn } from '@/components/ui/Button';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  ArrowLeft,
  Calendar,
  Tag,
  FileText,
  MessageSquare,
  Download,
  Trash2,
  Edit2,
  Loader2,
} from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { financeService } from '@/services/api';
import { useLocation, useNavigate } from 'react-router-dom';

export const Details = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const transaction = location.state?.transaction;

  const deleteRecordMutation = useMutation({
    mutationFn: ({ type, id }: { type: any; id: string }) => financeService.deleteRecord(type, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['extras'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      navigate('/listagem');
    },
  });

  const handleDelete = () => {
    if (!transaction) return;
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      let recordType: 'salary' | 'extra' | 'income' | 'expense';

      if (transaction.type === 'income') {
        if (transaction.description === 'Salário' || transaction.salaryId) recordType = 'salary';
        else if (transaction.sourceId || transaction.type === 'fixed') recordType = 'income';
        else recordType = 'extra';
      } else {
        recordType = 'expense';
      }

      deleteRecordMutation.mutate({ type: recordType, id: transaction.id });
    }
  };

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-primary-500">Nenhum detalhe disponível para este lançamento.</p>
        <Button onClick={() => navigate('/listagem')}>Voltar para Listagem</Button>
      </div>
    );
  }

  const isIncome = transaction.type === 'income';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-primary-800">Detalhes do Lançamento</h2>
            <p className="text-primary-500 text-sm">Registro gerado pelo sistema</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/cadastro', { state: { editRecord: transaction } })}
          >
            <Edit2 size={16} className="mr-2" /> Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleteRecordMutation.isPending}
          >
            {deleteRecordMutation.isPending ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : (
              <Trash2 size={16} className="mr-2" />
            )}
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card
            className={cn('border-l-4', isIncome ? 'border-l-success-500' : 'border-l-danger-500')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'p-3 rounded-xl',
                    isIncome ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600',
                  )}
                >
                  {isIncome ? <ArrowUpCircle size={32} /> : <ArrowDownCircle size={32} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary-800">{transaction.description}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant={isIncome ? 'success' : 'danger'}>
                      {isIncome ? 'Receita' : 'Despesa'}
                    </Badge>
                    <Badge variant="primary">
                      {transaction.category?.name || transaction.categoryName || 'Geral'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-primary-500 uppercase font-bold tracking-wider">
                  Valor do Lançamento
                </p>
                <p
                  className={cn(
                    'text-3xl font-black',
                    isIncome ? 'text-success-600' : 'text-danger-600',
                  )}
                >
                  {formatCurrency(transaction.value)}
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card title="Dados do Registro">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-primary-500 font-medium">Data do Lançamento</p>
                    <p className="text-sm font-semibold text-primary-800">
                      {new Date(transaction.date).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Tag className="text-primary-400 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs text-primary-500 font-medium">Categoria</p>
                    <p className="text-sm font-semibold text-primary-800 capitalize">
                      {transaction.category?.name || transaction.categoryName || 'Não definida'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Observações">
              <div className="flex items-start gap-3">
                <FileText className="text-primary-400 mt-0.5" size={18} />
                <p className="text-sm text-primary-600 leading-relaxed">
                  Lançamento realizado através do módulo de cadastro. Este registro impacta
                  diretamente o saldo disponível do mês corrente.
                </p>
              </div>
            </Card>
          </div>

          <Card title="Histórico">
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-primary-100">
              <div className="flex gap-6 relative">
                <div className="w-5 h-5 rounded-full bg-white border-4 border-success-500 z-10 flex-shrink-0"></div>
                <div className="pb-2">
                  <p className="text-sm font-bold text-primary-800">Lançamento Efetivado</p>
                  <p className="text-xs text-primary-500">
                    Sincronizado com o Banco de Dados em {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="flex gap-6 relative">
                <div className="w-5 h-5 rounded-full bg-white border-4 border-primary-400 z-10 flex-shrink-0"></div>
                <div className="pb-2">
                  <p className="text-sm font-bold text-primary-800">Registro Criado</p>
                  <p className="text-xs text-primary-500">Via Interface Web</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Ações Disponíveis">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download size={16} className="mr-2" /> Baixar Comprovante
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText size={16} className="mr-2" /> Gerar PDF
              </Button>
            </div>
          </Card>

          <Card title="Comentários">
            <div className="space-y-4">
              <div className="p-3 bg-primary-50 rounded-lg text-center py-8 italic text-primary-400 text-xs">
                Nenhum comentário adicionado.
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escreva um comentário..."
                  className="flex-1 bg-white border border-primary-200 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <Button size="sm" className="px-2">
                  <MessageSquare size={16} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
