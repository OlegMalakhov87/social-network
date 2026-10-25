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
  normalizeVideos,
  updateVideoApi,
} from '../../../entities/video';
import {
  useInfiniteScroll,
  useNormalizedData,
  useOptimisticCommentCount,
  useOptimisticCounter,
  useOptimisticLibraryToggle,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Возвращает ленту видео и изменяет её локально.
 *
 * @param {Object} params - Параметры запроса
 * @param {string} params.filter - Фильтр ленты
 * @param {string} params.searchQuery - Поисковый запрос
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {{
 *   videos: Array<Object>,
 *   currentUser: Object|null,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   hasMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   currentPage: number,
 *   refetch: Function,
 *   toggleLike: Function,
 *   addToLibrary: Function,
 *   deleteFromLibrary: Function,
 *   updateGlobalViewsCount: Function,
 *   updateCommentsCount: Function,
 *   addVideo: Function,
 *   updateVideo: Function,
 *   deleteVideo: Function
 * }} Видео и действия
 */
export const useVideos = ({ filter, searchQuery, sortKey }) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

  const scrollDeps = useMemo(
    () => [filter, searchQuery, sortKey, currentUserId],
    [filter, searchQuery, sortKey, currentUserId]
  );

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
    /**
     * Загружает страницу видео.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница видео
     */
    fetchFn: ({ page, limit, signal }) => {
      if (!currentUserId || currentUserId <= 0) {
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
  });

  const { addToLibrary, deleteFromLibrary } = useOptimisticLibraryToggle({
    setItems: setVideosItems,
    addFn: addVideoToLibrary,
    deleteFn: deleteVideoFromLibrary,
    entityType: 'videos',
  });

  const toggleLike = useOptimisticLike({
    setItems: setVideosItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId,
    targetType: 'videos',
  });

  const { incrementWithApi: updateGlobalViewsCount } = useOptimisticCounter({
    items: videosItems,
    setItems: setVideosItems,
    countField: 'viewsCount',
    updateFn: incrementVideoViewsCountApi,
  });

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
  });

  const updateCommentsCount = useOptimisticCommentCount(setVideosItems);

  /**
   * Нормализует видео и очищает идентификатор библиотеки профиля.
   *
   * @param {Object} item - Видео
   * @returns {Object} Нормализованное видео
   */
  const normalizeVideoFn = useCallback(
    (item) => ({
      ...normalizeVideos(item),
      profileLibraryId: null,
    }),
    []
  );

  const videos = useNormalizedData({
    items: videosItems,
    normalizeFn: normalizeVideoFn,
  });

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
