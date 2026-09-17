import { useCallback, useMemo } from 'react';
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
  normalizeTracks,
  updateTrackApi,
} from '../../../entities/track';
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
 * Хук для получения и управления треками на странице музыки с бесконечным скроллом.
 *
 * @param {Object|string} params
 * @param {Object} params
 * @param {string} [params.filter='all'] - фильтр
 * @param {string} [params.searchQuery=''] - поисковый запрос
 * @param {string} [params.sortKey='dateDesc'] - ключ сортировки
 * @returns {Object} - объект с данными о треках
 */
export const useMusic = ({ filter, searchQuery, sortKey }) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

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
      if (!currentUserId || currentUserId <= 0) {
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
  });

  /** Оптимистическое управление библиотекой треков */
  const { addToLibrary, deleteFromLibrary } = useOptimisticLibraryToggle({
    setItems: setTracksItems,
    addFn: addTrackToLibrary,
    deleteFn: deleteTrackFromLibrary,
    entityType: 'tracks',
  });

  /** Оптимистическое управление лайками треков */
  const toggleLike = useOptimisticLike({
    setItems: setTracksItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId,
    targetType: 'tracks',
  });

  /** Оптимистическое управление счётчиком прослушиваний треков */
  const { incrementWithApi: updateGlobalPlaysCount } = useOptimisticCounter({
    items: tracksItems,
    setItems: setTracksItems,
    countField: 'playsCount',
    updateFn: incrementTrackPlaysCount,
  });

  /** Оптимистическое управление добавлением, редактированием и удалением треков */
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
  });

  /** Оптимистическое управление счётчиком комментариев треков */
  const updateCommentsCount = useOptimisticCommentCount({
    setItems: setTracksItems,
  });

  /** Нормализация треков */
  const normalizeTracksFn = useCallback(
    (item) => ({
      ...normalizeTracks(item),
      profileLibraryId: null,
    }),
    []
  );

  /** Нормализованные треки */
  const tracks = useNormalizedData({
    items: tracksItems,
    normalizeFn: normalizeTracksFn,
  });

  /** Возвращаемые значения */
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
