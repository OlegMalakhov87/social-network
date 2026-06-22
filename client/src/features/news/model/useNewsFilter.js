import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { sortByData } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Хук фильтрации и сортировки новостей.
 * @param {Object} params
 * @param {string} params.filter - категория
 * @param {string} params.searchQuery - поисковый запрос
 * @param {string} params.sortKey - ключ сортировки
 * @returns {{ news: Array, isLoading: boolean, error: string|null }}
 */
export const useNewsFilter = ({ filter, searchQuery, sortKey }) => {
  const newsData = useSelector((state) => state.news?.newsData ?? []);
  const { status, error } = useSelector((state) => state.news);

  const filteredNews = useMemo(() => {
    return newsData.filter((item) => {
      const query = (searchQuery || '').toLowerCase();
      const matchesSearch =
        item.title?.toLowerCase().includes(query) || item.content?.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'All' ||
        String(item.category ?? '')
          .trim()
          .toLowerCase() === String(filter).trim().toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [newsData, searchQuery, filter]);

  const sortedNews = useMemo(() => {
    const sortConfig = SORT_OPTIONS[sortKey];
    return sortByData(filteredNews, sortConfig, 'News');
  }, [filteredNews, sortKey]);

  return {
    news: sortedNews,
    isLoading: status === 'loading',
    error,
  };
};
