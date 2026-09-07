import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import {
  addVideoApi,
  addVideoToLibrary,
  deleteVideoApi,
  deleteVideoFromLibrary,
  fetchVideosApi,
  incrementVideoViewsCountApi,
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

/**
 * Хук для получения и отображения видео на странице видео с бесконечным скроллом.
 *
 * @param {Object} params
 * @param {string} [params.filter='all'] - фильтр
 * @param {string} [params.searchQuery=''] - поисковый запрос
 * @param {string} [params.sortKey='dateDesc'] - ключ сортировки
 * @returns {Object} - объект с данными о видео
 */
export const useVideos = ({ filter, searchQuery, sortKey }) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;
  const notify = useNotify('videos');

  /** Зависимости для бесконечного скролла */
  const scrollDeps = useMemo(
    () => [filter, searchQuery, sortKey, currentUserId],
    [filter, searchQuery, sortKey, currentUserId]
  );

  /** Получение общей ленты видео с бесконечным скроллом */
  const {
    items: videosItems,
    setItems: setVideosItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    currentPage,
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ page, limit, signal }) => {
      if (!currentUserId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchVideosApi, {
        params: {
          filter,
          q: searchQuery,
          page,
          limit,
          sortKey,
        },
        signal,
      });
    },
    deps: scrollDeps,
    onError: () => notify.error('load'),
  });

  /** Оптимистическое управление библиотекой видео */
  const { addToLibrary, deleteFromLibrary } = useOptimisticLibraryToggle({
    setItems: setVideosItems,
    addFn: addVideoToLibrary,
    deleteFn: deleteVideoFromLibrary,
    entityType: 'videos',
  });

  /** Оптимистическое управление лайками видео */
  const toggleLike = useOptimisticLike({
    setItems: setVideosItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId,
    targetType: 'videos',
  });

  /** Оптимистическое управление счётчиком просмотров видео */
  const { incrementWithApi: updateGlobalViewsCount } = useOptimisticCounter({
    items: videosItems,
    setItems: setVideosItems,
    countField: 'viewsCount',
    updateFn: incrementVideoViewsCountApi,
  });

  /** Оптимистическое управление добавлением, редактированием и удалением видео */
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

  /** Оптимистическое управление счётчиком комментариев видео */
  const updateCommentsCount = useOptimisticCommentCount(setVideosItems);

  /** Нормализация видео */
  const normalizeVideoFn = useCallback(
    (item) => ({
      ...normalizeVideo(item),
      profileLibraryId: null,
    }),
    []
  );

  /** Нормализованные видео */
  const videos = useNormalizedData({
    items: videosItems,
    normalizeFn: normalizeVideoFn,
  });

  /** Возвращаемые значения */
  return {
    videos,
    currentUser,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    currentPage,
    refetch,
    toggleLike,
    addToLibrary,
    deleteFromLibrary,
    updateGlobalViewsCount,
    updateCommentsCount,
    addVideo,
    updateVideo,
    deleteVideo,
  };
};
