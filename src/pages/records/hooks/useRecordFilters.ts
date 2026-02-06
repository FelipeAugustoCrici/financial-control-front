import { useState } from 'react';

export function useRecordFilters() {
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [search, setSearch] = useState('');

  return {
    month,
    year,
    search,
    setMonth,
    setYear,
    setSearch,
  };
}
