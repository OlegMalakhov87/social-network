import { useCallback, useState } from 'react';

/**
 * Хук для управления фильтрами, поиском и сортировкой.
 *
 * @param {string|Object} [options='all'] - начальный фильтр или объект `{ initialFilter, initialSort }`
 * @param {string} [initialSortArg='dateDesc'] - начальная сортировка (если первый аргумент — строка)
 * @returns {Object} - объект с данными о фильтрах, поиске и сортировке
 */
export const useFilterControls = (options = 'all', initialSortArg = 'dateDesc') => {
  const isOptionsObject =
    typeof options === 'object' && options !== null && !Array.isArray(options);

  const initialFilter = isOptionsObject
    ? (options.initialFilter ?? 'all')
    : options;
  const initialSort = isOptionsObject
    ? (options.initialSort ?? 'dateDesc')
    : initialSortArg;

  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(initialSort);

  /** Сброс поиска и сортировки при смене фильтра */
  const handleFilterChange = useCallback(
    (id) => {
      setFilter(id);
      setSearchQuery('');
      setSortKey(initialSort);
    },
    [initialSort]
  );

  /** Сброс всех фильтров */
  const resetFilters = useCallback(() => {
    setFilter(initialFilter);
    setSearchQuery('');
    setSortKey(initialSort);
  }, [initialFilter, initialSort]);

  return {
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    handleFilterChange,
    resetFilters,
  };
};
