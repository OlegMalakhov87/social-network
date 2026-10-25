import { useMemo } from 'react';

import {
  fetchMyMusicLibrary,
  fetchUserMusicLibrary,
  normalizeTracks,
} from '../../../entities/track';
import { useInfiniteScroll, useNormalizedData } from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Возвращает треки библиотеки пользователя.
 *
 * @param {Object} params - Параметры запроса
 * @param {number|null} params.profileUserId - Идентификатор пользователя
 * @param {boolean} params.isOwnProfile - Признак своего профиля
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {{
 *   tracks: Array<Object>,
 *   hasMore: boolean,
 *   isLoading: boolean,
 *   loadMore: Function,
 *   isLoadingMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   refetch: Function,
 *   setTracksItems: Function
 * }} Треки библиотеки и состояние загрузки
 */
export const useUserMusicLibrary = ({
  profileUserId,
  isOwnProfile,
  sortKey,
}) => {
  const scrollDeps = useMemo(
    () => [profileUserId, sortKey],
    [profileUserId, sortKey]
  );
  const {
    items: tracksItems,
    setItems: setTracksItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useInfiniteScroll({
    /**
     * Загружает страницу библиотеки треков.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница треков
     */
    fetchFn: ({ page, limit, signal }) => {
      if (!profileUserId || profileUserId <= 0) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(
        isOwnProfile ? fetchMyMusicLibrary : fetchUserMusicLibrary,
        {
          params: { userId: profileUserId, page, limit, sortKey },
          signal,
        }
      );
    },
    deps: scrollDeps,
  });

  const tracks = useNormalizedData({
    items: tracksItems,
    normalizeFn: normalizeTracks,
  });

  return {
    tracks,
    hasMore,
    isLoading,
    loadMore,
    isLoadingMore,
    error,
    refetch,
    setTracksItems,
  };
};
