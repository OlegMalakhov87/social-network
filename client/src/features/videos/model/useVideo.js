import { useSelector } from 'react-redux';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
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
import { apiFetchItems } from '../../../shared/lib';
import { selectUser } from '../../auth';

/**
 * Хук для получения и отображения видео на странице видео.
 *
 * @param {string} filter - фильтр по категории
 * @param {string} searchQuery - поисковый запрос
 * @param {string} sortKey - ключ сортировки
 * @returns {Object} - объект с данными о видео
 */
export const useVideos = (filter, searchQuery, sortKey) => {
  const currentUser = useSelector(selectUser);
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
          sortKey,
        },
        signal,
      });
    },
    deps: [filter, searchQuery, sortKey],
    onSuccess: () => notify.success('load'),
    onError: () => notify.error('load'),
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
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
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

  /** Нормализация видео */
  const videos = useNormalizedData({
    items: videosItems,
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
};
