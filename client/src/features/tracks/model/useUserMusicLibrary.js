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
 * @param {number|null} profileUserId - ID пользователя
 * @param {number|null} currentUserId - ID текущего пользователя
 * @param {boolean} isOwnProfile - является ли текущий пользователь владельцем профиля
 * @param {string} sortKey - ключ сортировки
 * @returns {{ tracks: Array, hasMore: boolean, isLoading: boolean, isLoadingMore: boolean, error: string|null, refetch: Function, setTracksItems: Function, loadMore: Function }}
 */
export function useUserMusicLibrary(
  profileUserId,
  currentUserId,
  isOwnProfile,
  sortKey
) {
  const notify = useNotify('tracks');

  /**
   * Получение треков библиотеки пользователя.
   */
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

  /** Нормализация и сортировка новостей. */
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
}
