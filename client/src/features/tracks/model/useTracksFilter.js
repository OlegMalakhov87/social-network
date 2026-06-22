import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { sortByData } from '../../../shared/lib/index';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Хук для фильтрации и сортировки треков на странице музыки.
 * @param {Object} params
 * @param {string} params.filter - жанр для фильтрации
 * @param {string} params.searchQuery - поисковый запрос по названию/описанию
 * @param {string} params.sortKey - ключ сортировки из SORT_OPTIONS
 * @returns {{ tracks: Array<Object>, isLoading: boolean }}
 */
export const useTracksFilter = ({ filter, searchQuery, sortKey }) => {
  const musicData = useSelector((state) => state.music?.musicData ?? []);

  const filteredMusic = useMemo(() => {
    return musicData.filter((track) => {
      const query = (searchQuery || '').toLowerCase();
      const matchesSearch =
        track.title?.toLowerCase().includes(query) ||
        track.description?.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'All' ||
        String(track.genre ?? '')
          .trim()
          .toLowerCase() === String(filter).trim().toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [musicData, searchQuery, filter]);

  const sortedMusic = useMemo(() => {
    const sortConfig = SORT_OPTIONS[sortKey];
    return sortByData(filteredMusic, sortConfig, 'Music');
  }, [filteredMusic, sortKey]);

  return {
    tracks: sortedMusic,
    isLoading: false, // данные берутся синхронно из Redux, загрузки нет
  };
};
