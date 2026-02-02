import React, { useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { financeService } from '../services/api';
import { Goal, CreditCard } from '../types';

export const Planning: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);

  const [newGoal, setNewGoal] = useState({ description: '', targetValue: 0 });
  const [newBudget, setNewBudget] = useState({
    categoryName: 'alimentacao',
    categoryId: '',
    limitValue: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [newCard, setNewCard] = useState({ name: '', limit: 0, closingDay: 1, dueDay: 10 });

  const loadData = useCallback(async () => {
    try {
      const [goalsData, cardsData] = await Promise.all([
        financeService.getGoals(),
        financeService.getCreditCards(),
      ]);
      setGoals(goalsData);
      setCards(cardsData);
    } catch (error) {
      console.error('Erro ao carregar dados', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: financeService.getCategories,
  });

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    await financeService.addGoal(newGoal);
    alert('Meta criada!');
    setNewGoal({ description: '', targetValue: 0 });
    loadData();
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetData = {
      ...newBudget,
      categoryId: newBudget.categoryId || undefined,
    };
    await financeService.saveBudget(budgetData as any);
    alert('Orçamento definido!');
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    await financeService.addCreditCard(newCard);
    alert('Cartão adicionado!');
    setNewCard({ name: '', limit: 0, closingDay: 1, dueDay: 10 });
    loadData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Planejamento</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metas */}
        <Card title="Criar Nova Meta">
          <form onSubmit={handleAddGoal} className="space-y-4">
            <Input
              label="Descrição"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            />
            <Input
              label="Valor Alvo"
              type="number"
              value={newGoal.targetValue}
              onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
            />
            <Button type="submit" className="w-full">
              Criar Meta
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Minhas Metas</h4>
            {goals.map((goal) => (
              <div key={goal.id} className="text-sm p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span>{goal.description}</span>
                  <span className="font-bold">R$ {goal.targetValue}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(goal.currentValue / goal.targetValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Orçamentos */}
        <Card title="Definir Orçamento por Categoria">
          <form onSubmit={handleSaveBudget} className="space-y-4">
            <Select
              label="Categoria"
              value={newBudget.categoryId}
              onChange={(e) => {
                const val = e.target.value;
                const cat = _.find(categories, { id: val });
                setNewBudget({
                  ...newBudget,
                  categoryId: val,
                  categoryName: cat ? cat.name : 'outros',
                });
              }}
              options={[
                { label: 'Selecione uma categoria', value: '' },
                ..._.map(categories, (c) => ({ label: c.name, value: c.id })),
              ]}
            />
            <Input
              label="Limite Mensal"
              type="number"
              value={newBudget.limitValue}
              onChange={(e) => setNewBudget({ ...newBudget, limitValue: Number(e.target.value) })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Mês"
                type="number"
                value={newBudget.month}
                onChange={(e) => setNewBudget({ ...newBudget, month: Number(e.target.value) })}
              />
              <Input
                label="Ano"
                type="number"
                value={newBudget.year}
                onChange={(e) => setNewBudget({ ...newBudget, year: Number(e.target.value) })}
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full">
              Salvar Orçamento
            </Button>
          </form>
        </Card>

        {/* Cartões de Crédito */}
        <Card title="Cartões de Crédito">
          <form onSubmit={handleAddCard} className="space-y-4">
            <Input
              label="Nome do Cartão"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            />
            <Input
              label="Limite Total"
              type="number"
              value={newCard.limit}
              onChange={(e) => setNewCard({ ...newCard, limit: Number(e.target.value) })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Fechamento"
                type="number"
                value={newCard.closingDay}
                onChange={(e) => setNewCard({ ...newCard, closingDay: Number(e.target.value) })}
              />
              <Input
                label="Vencimento"
                type="number"
                value={newCard.dueDay}
                onChange={(e) => setNewCard({ ...newCard, dueDay: Number(e.target.value) })}
              />
            </div>
            <Button type="submit" variant="ghost" className="w-full border border-slate-200">
              Adicionar Cartão
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            {cards.map((card) => (
              <div
                key={card.id}
                className="p-3 border border-slate-100 rounded-lg flex justify-between items-center text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{card.name}</p>
                  <p className="text-slate-500 text-xs">Vence dia {card.dueDay}</p>
                </div>
                <span className="font-semibold">R$ {card.limit}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
