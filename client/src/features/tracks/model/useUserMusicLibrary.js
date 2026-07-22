import {
  fetchMyMusicLibrary,
  fetchUserMusicLibrary,
  normalizeTrack,
} from '../../../entities/track';
import { apiFetchItems } from '../../../shared/api';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
} from '../../../shared/hooks';
/**
 * Хук для получения треков библиотеки пользователя.
 *
 * @param {Object} params - параметры запроса
 * @param {number|null} params.profileUserId - ID пользователя
 * @param {number|null} params.currentUserId - ID текущего пользователя
 * @param {boolean} params.isOwnProfile - является ли текущий пользователь владельцем профиля
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Object} - объект с данными о треках библиотеки пользователя
 */
export const useUserMusicLibrary = ({
  profileUserId,
  currentUserId,
  isOwnProfile,
  sortKey,
}) => {
  const notify = useNotify('tracks');

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
          params: { userId: profileUserId, page, limit },
          signal,
        }
      );
    },
    deps: [profileUserId, sortKey],
    onSuccess: () => notify.success('load'),
    onError: () => notify.error('load'),
  });

  /** Нормализация и сортировка треков. */
  const tracks = useNormalizedData({
    items: tracksItems,
    entityType: 'tracks',
    sortKey,
    normalizeFn: normalizeTrack,
    userId: currentUserId,
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
