import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import {
  addNewsApi,
  deleteNewsApi,
  fetchNewsApi,
  normalizeNews,
  updateNewsApi,
  updateNewsViewCount,
} from '../../../entities/news';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
  useOptimisticCommentCount,
  useOptimisticCounter,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

const normalizeFilter = (value) =>
  typeof value === 'string' && value.trim() ? value : 'all';

const normalizeSearch = (value) =>
  typeof value === 'string' ? value : '';

/**
 * Хук для получения и фильтрации новостей с бесконечным скроллом.
 *
 * @param {Object|string} params - `{ filter, searchQuery, sortKey }` или filter (legacy)
 * @param {string} [searchQueryArg=''] - поисковый запрос (legacy)
 * @param {string} [sortKeyArg='dateDesc'] - ключ сортировки (legacy)
 * @returns {Object} - объект с данными о новостях
 */
export const useNews = (params, searchQueryArg = '', sortKeyArg = 'dateDesc') => {
  const isParamsObject =
    typeof params === 'object' && params !== null && !Array.isArray(params);

  const filter = normalizeFilter(
    isParamsObject ? params.filter : params
  );
  const searchQuery = normalizeSearch(
    isParamsObject ? params.searchQuery : searchQueryArg
  );
  const sortKey =
    (isParamsObject ? params.sortKey : sortKeyArg) ?? 'dateDesc';

  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;
  const notify = useNotify('news');

  const scrollDeps = useMemo(
    () => [filter, searchQuery, sortKey, currentUserId],
    [filter, searchQuery, sortKey, currentUserId]
  );

  /** Получение новостей с бесконечным скроллом. */
  const {
    items: newsItems,
    setItems: setNewsItems,
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
      return apiFetchItems(fetchNewsApi, {
        params: {
          filter,
          searchQuery,
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

  /** Оптимистичный лайк. */
  const toggleLike = useOptimisticLike({
    setItems: setNewsItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId,
    targetType: 'news',
  });

  /** Оптимистичный счётчик просмотров. */
  const { incrementWithApi: incrementViewCount } = useOptimisticCounter({
    items: newsItems,
    setItems: setNewsItems,
    countField: 'viewCount',
    updateFn: updateNewsViewCount,
  });

  /** Оптимистичный счётчик комментариев. */
  const updateCommentCount = useOptimisticCommentCount({
    setItems: setNewsItems,
  });

  /** Оптимистичные мутации (CRUD). */
  const { add: addNews, edit: updateNews, remove: deleteNews } =
    useOptimisticMutation({
      items: newsItems,
      setItems: setNewsItems,
      addFn: addNewsApi,
      editFn: updateNewsApi,
      deleteFn: deleteNewsApi,
      onSuccess: (action) => {
        notify.success(action);
      },
      onError: (action) => {
        notify.error(action);
      },
    });

  /** Нормализация новостей. */
  const news = useNormalizedData({
    items: newsItems,
    normalizeFn: normalizeNews,
    userId: currentUserId,
  });

  return {
    news,
    currentUser,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refetch,
    addNews,
    deleteNews,
    updateNews,
    toggleLike,
    incrementViewCount,
    updateCommentCount,
  };
};
