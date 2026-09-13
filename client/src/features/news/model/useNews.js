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
  updateNewsViewsCountApi,
} from '../../../entities/news';
import {
  useInfiniteScroll,
  useNormalizedData,
  useOptimisticCommentCount,
  useOptimisticCounter,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Хук для получения и фильтрации новостей с бесконечным скроллом.
 *
 * @param {Object|string} params
 * @param {string} [filter='all'] - фильтр
 * @param {string} [searchQuery=''] - поисковый запрос
 * @param {string} [sortKey='dateDesc'] - ключ сортировки
 * @returns {Object} - объект с данными о новостях
 */
export const useNews = ({ filter, searchQuery, sortKey }) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

  /** Зависимости для бесконечного скролла */
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
    currentPage,
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ page, limit, signal }) => {
      if (!currentUserId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchNewsApi, {
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

  /** Оптимистичный лайк. */
  const toggleLike = useOptimisticLike({
    setItems: setNewsItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId,
    targetType: 'news',
  });

  /** Оптимистичный счётчик просмотров. */
  const { incrementWithApi: incrementViewsCount } = useOptimisticCounter({
    items: newsItems,
    setItems: setNewsItems,
    countField: 'viewsCount',
    updateFn: updateNewsViewsCountApi,
  });

  /** Оптимистичный счётчик комментариев. */
  const updateCommentsCount = useOptimisticCommentCount(setNewsItems);

  /** Оптимистичные мутации (CRUD). */
  const {
    add: addNews,
    edit: updateNews,
    remove: deleteNews,
  } = useOptimisticMutation({
    items: newsItems,
    setItems: setNewsItems,
    addFn: addNewsApi,
    editFn: updateNewsApi,
    deleteFn: deleteNewsApi,
  });

  /** Нормализация новостей. */
  const news = useNormalizedData({
    items: newsItems,
    normalizeFn: normalizeNews,
  });

  /** Возвращаемые значения */
  return {
    news,
    currentUser,
    hasMore,
    isLoading,
    isLoadingMore,
    currentPage,
    error,
    loadMore,
    refetch,
    addNews,
    deleteNews,
    updateNews,
    toggleLike,
    incrementViewsCount,
    updateCommentsCount,
  };
};
