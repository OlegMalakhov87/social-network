import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import {
  addTrackApi,
  addTrackToLibrary,
  deleteTrackApi,
  deleteTrackFromLibrary,
  fetchTracksApi,
  incrementTrackPlaysCount,
  normalizeTrack,
  updateTrackApi,
} from '../../../entities/track';
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
 * Хук для получения и управления треками на странице музыки с бесконечным скроллом.
 *
 * @param {Object|string} params - `{ filter, searchQuery, sortKey }` или filter (legacy)
 * @param {string} [searchQueryArg=''] - поисковый запрос (legacy)
 * @param {string} [sortKeyArg='dateDesc'] - ключ сортировки (legacy)
 * @returns {Object} - объект с данными о треках
 */
export const useMusic = (
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
  const notify = useNotify('tracks');

  const scrollDeps = useMemo(
    () => [filter, searchQuery, sortKey, currentUserId],
    [filter, searchQuery, sortKey, currentUserId]
  );

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
      if (!currentUserId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchTracksApi, {
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
    setItems: setTracksItems,
    addFn: addTrackToLibrary,
    deleteFn: deleteTrackFromLibrary,
    entityType: 'tracks',
  });

  const toggleLike = useOptimisticLike({
    setItems: setTracksItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId,
    targetType: 'tracks',
  });

  const { incrementWithApi: updateGlobalPlaysCount } = useOptimisticCounter({
    items: tracksItems,
    setItems: setTracksItems,
    countField: 'playsCount',
    updateFn: incrementTrackPlaysCount,
  });

  const {
    add: addTrack,
    edit: updateTrack,
    remove: deleteTrack,
  } = useOptimisticMutation({
    items: tracksItems,
    setItems: setTracksItems,
    addFn: addTrackApi,
    editFn: updateTrackApi,
    deleteFn: deleteTrackApi,
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  const updateCommentsCount = useOptimisticCommentCount({
    setItems: setTracksItems,
  });

  const tracks = useNormalizedData({
    items: tracksItems,
    normalizeFn: (item) => ({
      ...normalizeTrack(item, currentUserId),
      profileLibraryId: null,
    }),
    userId: currentUserId,
  });

  return {
    tracks,
    currentUser,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
    toggleLike,
    addTrack,
    updateTrack,
    deleteTrack,
    addToLibrary,
    deleteFromLibrary,
    updateGlobalPlaysCount,
    updateCommentsCount,
  };
};
