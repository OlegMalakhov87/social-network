import { selectUser } from '../../../app/providers/slices/auth/authSelectors';
import { addLike, deleteLike } from '../../../entities/like';
import {
  addVideoApi,
  addVideoToLibrary,
  deleteVideoApi,
  deleteVideoFromLibrary,
  fetchVideosApi,
  incrementVideoViewCount,
  normalizeVideo,
  updateVideoApi,
} from '../../../entities/video';
import { apiFetchItems } from '../../../shared/api';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
  useOptimisticCommentCount,
  useOptimisticCounter,
  useOptimisticLibraryToggle,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';

/**
 * Хук для получения и отображения видео на странице видео.
 * @param {Object} params
 * @param {string} [params.filter] – фильтр по категории
 * @param {string} [params.searchQuery] – поисковый запрос
 * @param {string} [params.sortKey] – ключ сортировки
 * @returns {Object} - Результат
 */
export function useVideos({ filter, searchQuery, sortKey } = {}) {
  const currentUser = selectUser();
  const notify = useNotify('videos');

  /** Получение видео с бесконечным скроллом */
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
      if (!filter && !searchQuery) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchVideosApi, {
        params: {
          filter,
          searchQuery,
          page,
          limit,
        },
        signal,
      });
    },
    deps: [filter, searchQuery, sortKey],
    options: {
      autoFetch: true,
      onSuccess: () => notify.success('load'),
      onError: () => notify.error('load'),
    },
  });

  /** Оптимистичный переключатель библиотеки */
  const { addToLibrary, removeFromLibrary } = useOptimisticLibraryToggle({
    setItems: setVideosItems,
    addFn: addVideoToLibrary,
    removeFn: deleteVideoFromLibrary,
    entityType: 'videos',
  });

  /** Оптимистичный лайк */
  const toggleLike = useOptimisticLike({
    setItems: setVideosItems,
    addLikeFn: addLike,
    deleteLikeFn: deleteLike,
    currentUserId: currentUser?.id,
    targetType: 'videos',
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  /** Оптимистичный счётчик прослушиваний. */
  const { incrementWithApi: incrementViewCount } = useOptimisticCounter({
    items: videosItems,
    setItems: setVideosItems,
    countField: 'viewCount',
    updateFn: incrementVideoViewCount,
  });

  /** Оптимистичные мутации (CRUD) */
  const {
    add: addVideo,
    edit: updateVideo,
    remove: deleteVideo,
  } = useOptimisticMutation({
    items: videosItems,
    setItems: setVideosItems,
    addFn: addVideoApi,
    editFn: updateVideoApi,
    deleteFn: deleteVideoApi,
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  /** Оптимистичный счётчик комментариев. */
  const updateCommentCount = useOptimisticCommentCount({
    setItems: setVideosItems,
  });

  /** Нормализация и сортировка */
  const videos = useNormalizedData({
    items: videosItems,
    entityType: 'videos',
    sortKey,
    normalizeFn: (item) => ({
      ...normalizeVideo(item, currentUser?.id),
      profileLibraryId: null,
    }),
    userId: currentUser?.id,
  });

  return {
    videos,
    currentUser,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
    toggleLike,
    addToLibrary,
    removeFromLibrary,
    incrementViewCount,
    updateCommentCount,
    addVideo,
    updateVideo,
    deleteVideo,
  };
}
