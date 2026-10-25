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
 * Возвращает ленту треков и изменяет её локально.
 *
 * @param {Object} params - Параметры запроса
 * @param {string} params.filter - Фильтр ленты
 * @param {string} params.searchQuery - Поисковый запрос
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {{
 *   tracks: Array<Object>,
 *   currentUser: Object|null,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   hasMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   refetch: Function,
 *   toggleLike: Function,
 *   addTrack: Function,
 *   updateTrack: Function,
 *   deleteTrack: Function,
 *   addToLibrary: Function,
 *   deleteFromLibrary: Function,
 *   updateGlobalPlaysCount: Function,
 *   updateCommentsCount: Function
 * }} Треки и действия
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
    /**
     * Загружает страницу треков.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница треков
     */
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
  });

  const updateCommentsCount = useOptimisticCommentCount(setTracksItems);

  /**
   * Нормализует трек и очищает идентификатор библиотеки профиля.
   *
   * @param {Object} item - Трек
   * @returns {Object} Нормализованный трек
   */
  const normalizeTracksFn = useCallback(
    (item) => ({
      ...normalizeTracks(item),
      profileLibraryId: null,
    }),
    []
  );

  const tracks = useNormalizedData({
    items: tracksItems,
    normalizeFn: normalizeTracksFn,
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
