export type RecordKind = 'income' | 'expense';

export type RecordOrigin =
  | 'expenses'
  | 'salaries'
  | 'extras'
  | 'incomes'
  | 'budgets'
  | 'categories'
  | 'credit-cards'
  | 'goals';

export type RecordCategory = {
  id: string;
  name: string;
};

export type UnifiedRecord = {
  id: string;
  description: string;
  value: number;
  date: string;
  personId: string;
  type: RecordKind;
  originalType: RecordOrigin;
  category?: RecordCategory | null;
  categoryName?: string;
  recurringId?: string | null;
  sourceId?: string | null;
};
