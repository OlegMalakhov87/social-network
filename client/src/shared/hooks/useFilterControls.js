import { useCallback, useState } from 'react';

/**
 * Хранит фильтр, строку поиска и сортировку.
 *
 * @param {Object} params - Начальные значения
 * @param {string|Object} [params.initialFilter='all'] - Начальный фильтр
 * @param {string} [params.initialSort='dateDesc'] - Начальная сортировка
 * @returns {{
 *   filter: string|Object,
 *   setFilter: Function,
 *   searchQuery: string,
 *   setSearchQuery: Function,
 *   sortKey: string,
 *   setSortKey: Function,
 *   handleFilterChange: Function,
 *   resetFilters: Function
 * }} Состояние фильтров и методы изменения.
 */
export const useFilterControls = ({
  initialFilter = 'all',
  initialSort = 'dateDesc',
}) => {
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(initialSort);

  /**
   * Меняет фильтр и сбрасывает поиск и сортировку.
   *
   * @param {string|Object} id - Новый фильтр
   * @returns {void}
   */
  const handleFilterChange = useCallback(
    (id) => {
      setFilter(id);
      setSearchQuery('');
      setSortKey(initialSort);
    },
    [initialSort]
  );

  /**
   * Возвращает фильтр, поиск и сортировку к начальным значениям.
   *
   * @returns {void}
   */
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
