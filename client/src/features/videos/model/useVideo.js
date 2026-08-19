import { useMemo } from 'react';
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

const normalizeFilter = (value) =>
  typeof value === 'string' && value.trim() ? value : 'all';

const normalizeSearch = (value) => (typeof value === 'string' ? value : '');

/**
 * Хук для получения и отображения видео на странице видео с бесконечным скроллом.
 *
 * @param {Object|string} params - `{ filter, searchQuery, sortKey }` или filter (legacy)
 * @param {string} [searchQueryArg=''] - поисковый запрос (legacy)
 * @param {string} [sortKeyArg='dateDesc'] - ключ сортировки (legacy)
 * @returns {Object} - объект с данными о видео
 */
export const useVideos = (
  params,
  searchQueryArg = '',
  sortKeyArg = 'dateDesc'
) => {
  const isParamsObject =
    typeof params === 'object' && params !== null && !Array.isArray(params);

  const filter = normalizeFilter(isParamsObject ? params.filter : params);
  const searchQuery = normalizeSearch(
    isParamsObject ? params.searchQuery : searchQueryArg
  );
  const sortKey = (isParamsObject ? params.sortKey : sortKeyArg) ?? 'dateDesc';

  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;
  const notify = useNotify('videos');

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
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  const updateCommentsCount = useOptimisticCommentCount({
    setItems: setVideosItems,
  });

  const videos = useNormalizedData({
    items: videosItems,
    normalizeFn: (item) => ({
      ...normalizeVideo(item, currentUserId),
      profileLibraryId: null,
    }),
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
    deleteFromLibrary,
    updateGlobalViewsCount,
    updateCommentsCount,
    addVideo,
    updateVideo,
    deleteVideo,
  };
};
