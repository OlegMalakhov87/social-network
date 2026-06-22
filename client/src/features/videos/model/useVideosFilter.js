import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { sortByData } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Хук для фильтрации и сортировки видео.
 * @param {Object} params
 * @param {string} params.filter - категория для фильтрации
 * @param {string} params.searchQuery - поисковый запрос
 * @param {string} params.sortKey - ключ сортировки
 * @returns {{ videos: Array<Object>, isLoading: boolean }}
 */
export const useVideosFilter = ({ filter, searchQuery, sortKey }) => {
  const videosData = useSelector((state) => state.videos?.videosData ?? []);

  const filteredVideos = useMemo(() => {
    return videosData.filter((video) => {
      const query = (searchQuery || '').toLowerCase();
      const matchesSearch =
        video.title?.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'All' ||
        String(video.category ?? '')
          .trim()
          .toLowerCase() === String(filter).trim().toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [videosData, searchQuery, filter]);

  const sortedVideos = useMemo(() => {
    const sortConfig = SORT_OPTIONS[sortKey];
    return sortByData(filteredVideos, sortConfig, 'Video');
  }, [filteredVideos, sortKey]);

  return {
    videos: sortedVideos,
    isLoading: false,
  };
};
