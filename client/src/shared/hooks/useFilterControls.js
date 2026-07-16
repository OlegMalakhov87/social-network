import { useState, useCallback } from 'react';

/**
 * Хук для управления фильтрами, поиском и сортировкой.
 * Используется на страницах со списками (NewsPage, FriendsPage, MusicPage и т.д.)
 *
 * @param {Object} options
 * @param {string} [options.initialFilter='all'] - начальный фильтр
 * @param {string} [options.initialSort='dateDesc'] - начальная сортировка
 * @returns {Object}
 */
export const useFilterControls = ({
  initialFilter = 'all',
  initialSort = 'dateDesc',
} = {}) => {
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState(initialSort);

  /** Сброс поиска и сортировки при смене фильтра */
  const handleFilterChange = useCallback((id) => {
    setFilter(id);
    setSearchQuery('');
    setSortKey(initialSort);
  }, [initialSort]);

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