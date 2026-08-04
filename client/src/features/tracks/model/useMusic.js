import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import {
  addTrackApi,
  addTrackToLibrary,
  deleteTrackApi,
  deleteTrackFromLibrary,
  fetchTracksApi,
  incrementTrackPlayCount,
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

/**
 * Хук для получения и управления треками на странице музыки с бесконечным скроллом.
 *
 * @param {string} filter - фильтр по жанру
 * @param {string} searchQuery - поисковый запрос
 * @param {string} sortKey - ключ сортировки из SORT_OPTIONS
 * @returns {Object} - объект с данными о треках
 */
export const useMusic = (filter, searchQuery, sortKey) => {
  const currentUser = useSelector(selectUser);
  const notify = useNotify('tracks');

  /** Получение треков с бесконечным скроллом */
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
      if (!filter && !searchQuery) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchTracksApi, {
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
    setItems: setTracksItems,
    addFn: addTrackToLibrary,
    removeFn: deleteTrackFromLibrary,
    entityType: 'tracks',
  });

  /** Оптимистичный лайк */
  const toggleLike = useOptimisticLike({
    setItems: setTracksItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: currentUser?.id,
    targetType: 'tracks',
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  /** Оптимистичный счётчик прослушиваний. */
  const { incrementWithApi: incrementPlayCount } = useOptimisticCounter({
    items: tracksItems,
    setItems: setTracksItems,
    countField: 'playCount',
    updateFn: incrementTrackPlayCount,
  });

  /** Оптимистичные мутации (CRUD) */
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

  /** Оптимистичный счётчик комментариев. */
  const updateCommentCount = useOptimisticCommentCount({
    setItems: setTracksItems,
  });

  /** Нормализация треков */
  const tracks = useNormalizedData({
    items: tracksItems,
    normalizeFn: (item) => ({
      ...normalizeTrack(item, currentUser?.id),
      profileLibraryId: null,
    }),
    userId: currentUser?.id,
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
    removeFromLibrary,
    incrementPlayCount,
    updateCommentCount,
  };
};
