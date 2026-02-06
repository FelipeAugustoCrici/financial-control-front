export const recordsKeys = {
  all: ['records'] as const,
  list: (month: number, year: number, familyId?: string) =>
    [...recordsKeys.all, month, year, familyId] as const,
};
