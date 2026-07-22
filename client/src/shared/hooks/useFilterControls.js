import { useCallback, useState } from 'react';

/**
 * Хук для управления фильтрами, поиском и сортировкой.
 *
 * @param {string} initialFilter - начальный фильтр
 * @param {string} initialSort - начальная сортировка
 * @returns {Object} - объект с данными о фильтрах, поиске и сортировке
 */
export const useFilterControls = (
  initialFilter = 'all',
  initialSort = 'dateDesc'
) => {
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
