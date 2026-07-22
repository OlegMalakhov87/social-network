import {
  fetchMyVideoLibrary,
  fetchUserVideoLibrary,
  normalizeVideo,
} from '../../../entities/video';
import { apiFetchItems } from '../../../shared/lib';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
} from '../../../shared/hooks';

/**
 * Хук для получения видео библиотеки пользователя.
 *
 * @param {Object} params - параметры запроса
 * @param {number|null} params.profileUserId - ID пользователя
 * @param {number|null} params.currentUserId - ID текущего пользователя
 * @param {boolean} params.isOwnProfile - является ли текущий пользователь владельцем профиля
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Object} - объект с данными о видео библиотеке пользователя
 */
export const useUserVideoLibrary = ({
  profileUserId,
  currentUserId,
  isOwnProfile,
  sortKey,
}) => {
  const notify = useNotify('videos');

  /** Получение видео библиотеки пользователя. */
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

  /** Нормализация и сортировка видео. */
  const videos = useNormalizedData({
    items: videosItems,
    entityType: 'videos',
    sortKey,
    normalizeFn: normalizeVideo,
    userId: currentUserId,
  });

  /** Объект с данными о видео библиотеке пользователя. */
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
