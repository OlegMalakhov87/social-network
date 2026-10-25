import { useMemo } from 'react';

import {
  fetchMyVideoLibrary,
  fetchUserVideoLibrary,
  normalizeVideos,
} from '../../../entities/video';
import { useInfiniteScroll, useNormalizedData } from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Возвращает видео библиотеки пользователя.
 *
 * @param {Object} params - Параметры запроса
 * @param {number|null} params.profileUserId - Идентификатор пользователя
 * @param {boolean} params.isOwnProfile - Признак своего профиля
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {{
 *   videos: Array<Object>,
 *   hasMore: boolean,
 *   isLoading: boolean,
 *   loadMore: Function,
 *   isLoadingMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   refetch: Function,
 *   setVideosItems: Function
 * }} Видео библиотеки и состояние загрузки
 */
export const useUserVideoLibrary = ({
  profileUserId,
  isOwnProfile,
  sortKey,
}) => {
  const scrollDeps = useMemo(
    () => [profileUserId, sortKey],
    [profileUserId, sortKey]
  );
  const {
    items: videosItems,
    setItems: setVideosItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useInfiniteScroll({
    /**
     * Загружает страницу библиотеки видео.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница видео
     */
    fetchFn: ({ page, limit, signal }) => {
      if (!profileUserId || profileUserId <= 0) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(
        isOwnProfile ? fetchMyVideoLibrary : fetchUserVideoLibrary,
        {
          params: { userId: profileUserId, page, limit, sortKey },
          signal,
        }
      );
    },
    deps: scrollDeps,
  });

  const videos = useNormalizedData({
    items: videosItems,
    normalizeFn: normalizeVideos,
  });

  return {
    videos,
    hasMore,
    isLoading,
    loadMore,
    isLoadingMore,
    error,
    refetch,
    setVideosItems,
  };
};
