export function resolveEditDefaults(editRecord: any) {
  if (!editRecord) return null;

  let finalType: 'expense' | 'salary' | 'income' =
    editRecord.type === 'expense' ? 'expense' : 'income';

  if (editRecord.description === 'Salário' || editRecord.salaryId || editRecord.sourceId) {
    finalType = 'salary';
  }

  return {
    description: editRecord.description,
    value: String(editRecord.value),
    date: editRecord.date.split('T')[0],
    categoryName: editRecord.categoryName || editRecord.category?.name,
    categoryId: editRecord.categoryId || '',
    type: finalType,
    personId: editRecord.personId,
    familyId: editRecord.familyId,
    isRecurring: Boolean(editRecord.recurringId),
    durationMonths: '',
  };
}
