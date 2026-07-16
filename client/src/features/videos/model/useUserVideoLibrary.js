import {
  fetchMyVideoLibrary,
  fetchUserVideoLibrary,
  normalizeVideo,
} from '../../../entities/video';
import { apiFetchItems } from '../../../shared/api';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
} from '../../../shared/hooks';

/**
 * Хук для получения видео библиотеки пользователя.
 * @param {number|null} profileUserId - ID пользователя
 * @param {number|null} currentUserId - ID текущего пользователя
 * @param {boolean} isOwnProfile - является ли текущий пользователь владельцем профиля
 * @param {string} sortKey - ключ сортировки
 * @returns {{ videos: Array, isLoading: boolean, error: string|null, refetch: Function, setRawVideos: Function, loadMore: Function }}
 */
export function useUserVideoLibrary(
  profileUserId,
  currentUserId,
  isOwnProfile,
  sortKey
) {
  const notify = useNotify('videos');

  /**
   * Получение видео библиотеки пользователя.
   */
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
    fetchFn: ({ page, limit, signal }) => {
      if (!profileUserId || profileUserId <= 0) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(
        isOwnProfile ? fetchMyVideoLibrary : fetchUserVideoLibrary,
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
  const videos = useNormalizedData({
    items: videosItems,
    entityType: 'videos',
    sortKey,
    normalizeFn: normalizeVideo,
    userId: currentUserId,
  });

  /**
   * Возвращаем объект с данными о видео библиотеке пользователя.
   */
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
}
