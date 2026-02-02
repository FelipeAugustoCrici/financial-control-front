import React, { useState } from 'react';
import _ from 'lodash';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Loader2, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { financeService } from '@/services/api';

export const Families = () => {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newMemberName, setNewMemberName] = useState<{ [key: string]: string }>({});

  const { data: families = [], isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: financeService.getFamilies,
  });

  const createFamilyMutation = useMutation({
    mutationFn: (name: string) => financeService.createFamily(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setNewFamilyName('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: () => setError('Erro ao criar família'),
  });

  const createMemberMutation = useMutation({
    mutationFn: ({ name, familyId }: { name: string; familyId: string }) =>
      financeService.createPerson(name, familyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      setNewMemberName({});
    },
    onError: () => setError('Erro ao adicionar membro'),
  });

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName) return;
    setError(null);
    createFamilyMutation.mutate(newFamilyName);
  };

  const handleCreateMember = (familyId: string) => {
    const name = newMemberName[familyId];
    if (!name) return;
    createMemberMutation.mutate({ name, familyId });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-800">Gerenciamento de Famílias</h2>
          <p className="text-primary-500">Cadastre famílias e seus respectivos membros</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card title="Nova Família">
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <Input
                label="Nome da Família"
                placeholder="Ex: Família Silva, Mansão Wayne..."
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={createFamilyMutation.isPending}>
                {createFamilyMutation.isPending ? (
                  <Loader2 size={18} className="mr-2 animate-spin" />
                ) : (
                  <Plus size={18} className="mr-2" />
                )}
                Criar Família
              </Button>

              {success && (
                <div className="flex items-center gap-2 text-success-600 text-sm animate-in fade-in">
                  <CheckCircle2 size={16} />
                  Família criada com sucesso!
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-danger-600 text-sm animate-in fade-in">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card title="Famílias e Membros">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : families.length === 0 ? (
              <div className="text-center py-12 text-primary-400 italic">
                Nenhuma família cadastrada.
              </div>
            ) : (
              <div className="space-y-6">
                {_.map(families, (family) => (
                  <div
                    key={family.id}
                    className="p-5 border border-primary-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary-50">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-100 text-primary-700 rounded-xl">
                          <Users size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-primary-900">{family.name}</h3>
                      </div>
                      <span className="text-xs font-semibold text-primary-400 bg-primary-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {family.members?.length || 0} Membros
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-3">
                          Membros Atuais
                        </p>
                        {family.members?.length === 0 ? (
                          <p className="text-sm text-primary-400 italic">Nenhum membro cadastrado.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {_.map(family.members, (member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-lg text-sm font-medium border border-success-100"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-success-500"></div>
                                {member.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-bold text-primary-400 uppercase tracking-widest">
                          Adicionar Membro
                        </p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Nome do Membro"
                            value={newMemberName[family.id] || ''}
                            onChange={(e) =>
                              setNewMemberName({ ...newMemberName, [family.id]: e.target.value })
                            }
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCreateMember(family.id)}
                            disabled={createMemberMutation.isPending}
                          >
                            <UserPlus size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
