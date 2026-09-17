import { useMemo } from 'react';
import {
  fetchMyMusicLibrary,
  fetchUserMusicLibrary,
  normalizeTracks,
} from '../../../entities/track';
import { useInfiniteScroll, useNormalizedData } from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Хук для получения треков библиотеки пользователя.
 *
 * @param {Object} params - параметры запроса
 * @param {number|null} params.profileUserId - ID пользователя
 * @param {boolean} params.isOwnProfile - является ли текущий пользователь владельцем профиля
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Object} - объект с данными о треках библиотеки пользователя
 */
export const useUserMusicLibrary = ({
  profileUserId,
  isOwnProfile,
  sortKey,
}) => {
  /** Зависимости для скролла */
  const scrollDeps = useMemo(
    () => [profileUserId, sortKey],
    [profileUserId, sortKey]
  );
  /** Получение треков библиотеки пользователя с бесконечным скроллом. */
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

  /** Нормализация треков. */
  const tracks = useNormalizedData({
    items: tracksItems,
    normalizeFn: normalizeTracks,
  });

  /**
   * Возвращаем объект с данными о треках библиотеки пользователя.
   */
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
