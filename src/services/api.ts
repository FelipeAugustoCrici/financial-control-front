import axios from 'axios';
import {
  Salary,
  ExtraIncome,
  Income,
  Expense,
  Goal,
  Budget,
  CreditCard,
  Summary,
  Family,
  Person,
  Category,
} from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

const prefix = '/finance';

export const financeService = {
  // Categorias
  async getCategories() {
    const response = await api.get<Category[]>(`${prefix}/categories`);
    return response.data;
  },
  async createCategory(data: { name: string; type: string }) {
    const response = await api.post<Category>(`${prefix}/categories`, data);
    return response.data;
  },

  // Famílias e Pessoas
  async getFamilies() {
    const response = await api.get<Family[]>(`${prefix}/families`);
    return response.data;
  },
  async createFamily(name: string) {
    const response = await api.post<Family>(`${prefix}/families`, { name });
    return response.data;
  },
  async createPerson(name: string, familyId: string) {
    const response = await api.post<Person>(`${prefix}/persons`, { name, familyId });
    return response.data;
  },

  // Salários
  async saveSalary(data: Salary) {
    const response = await api.post(`${prefix}/salaries`, data);
    return response.data;
  },
  async getSalaries(month: number, year: number) {
    const response = await api.get<Salary[]>(`${prefix}/salaries?month=${month}&year=${year}`);
    return response.data;
  },

  // Extras
  async addExtra(data: ExtraIncome) {
    const response = await api.post(`${prefix}/extras`, data);
    return response.data;
  },
  async getExtras(month: number, year: number) {
    const response = await api.get<{ data: ExtraIncome[] }>(
      `${prefix}/extras?month=${month}&year=${year}`,
    );
    return response.data;
  },

  // Incomes (Novo modelo)
  async addIncome(data: Income & { isRecurring?: boolean; durationMonths?: number }) {
    const response = await api.post(`${prefix}/incomes`, data);
    return response.data;
  },
  async getIncomes(month: number, year: number, familyId?: string) {
    let url = `${prefix}/incomes?month=${month}&year=${year}`;
    if (familyId) url += `&familyId=${familyId}`;
    const response = await api.get<Income[]>(url);
    return response.data;
  },

  // Gastos
  async addExpense(data: Expense) {
    const response = await api.post(`${prefix}/expenses`, data);
    return response.data;
  },
  async getExpenses(month: number, year: number, familyId?: string) {
    let url = `${prefix}/expenses?month=${month}&year=${year}`;
    if (familyId) url += `&familyId=${familyId}`;
    const response = await api.get<Expense[]>(url);
    return response.data;
  },

  // Resumo
  async getSummary(month: number, year: number) {
    const response = await api.get<Summary>(`${prefix}/summary?month=${month}&year=${year}`);
    return response.data;
  },

  // Metas
  async addGoal(data: Partial<Goal>) {
    const response = await api.post(`${prefix}/goals`, data);
    return response.data;
  },
  async getGoals() {
    const response = await api.get<Goal[]>(`${prefix}/goals`);
    return response.data;
  },

  // Orçamentos
  async saveBudget(data: Budget) {
    const response = await api.post(`${prefix}/budgets`, data);
    return response.data;
  },
  async getBudgets(month: number, year: number) {
    const response = await api.get<Budget[]>(`${prefix}/budgets?month=${month}&year=${year}`);
    return response.data;
  },

  // Cartões
  async addCreditCard(data: CreditCard) {
    const response = await api.post(`${prefix}/credit-cards`, data);
    return response.data;
  },
  async getCreditCards() {
    const response = await api.get<CreditCard[]>(`${prefix}/credit-cards`);
    return response.data;
  },

  // Generic Update and Delete
  async deleteRecord(
    type:
      | 'salaries'
      | 'extras'
      | 'incomes'
      | 'expenses'
      | 'budgets'
      | 'categories'
      | 'credit-cards'
      | 'goals',
    id: string,
  ) {
    await api.delete(`${prefix}/${type}/${id}`);
  },
  async updateRecord(
    type:
      | 'salaries'
      | 'extras'
      | 'incomes'
      | 'expenses'
      | 'budgets'
      | 'categories'
      | 'credit-cards'
      | 'goals',
    id: string,
    data: any,
  ) {
    const response = await api.patch(`${prefix}/${type}/${id}`, data);
    return response.data;
  },
};
