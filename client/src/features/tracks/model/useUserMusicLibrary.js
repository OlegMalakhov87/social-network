import {
  fetchMyMusicLibrary,
  fetchUserMusicLibrary,
  normalizeTrack,
} from '../../../entities/track';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';
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
          params: { userId: profileUserId, page, limit, sortKey },
          signal,
        }
      );
    },
    deps: [profileUserId, sortKey],
    onSuccess: () => notify.success('load'),
    onError: () => notify.error('load'),
  });

  /** Нормализация треков. */
  const tracks = useNormalizedData({
    items: tracksItems,
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
