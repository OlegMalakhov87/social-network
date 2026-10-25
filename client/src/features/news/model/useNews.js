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
 * Возвращает ленту новостей и изменяет её локально.
 *
 * @param {Object} params - Параметры запроса
 * @param {string} params.filter - Фильтр ленты
 * @param {string} params.searchQuery - Поисковый запрос
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {{
 *   news: Array<Object>,
 *   currentUser: Object|null,
 *   hasMore: boolean,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   currentPage: number,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   refetch: Function,
 *   addNews: Function,
 *   deleteNews: Function,
 *   updateNews: Function,
 *   toggleLike: Function,
 *   incrementViewsCount: Function,
 *   updateCommentsCount: Function
 * }} Новости и действия
 */
export const useNews = ({ filter, searchQuery, sortKey }) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

  const scrollDeps = useMemo(
    () => [filter, searchQuery, sortKey, currentUserId],
    [filter, searchQuery, sortKey, currentUserId]
  );

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
    /**
     * Загружает страницу новостей.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница новостей
     */
    fetchFn: ({ page, limit, signal }) => {
      if (!currentUserId || currentUserId <= 0) {
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

  const toggleLike = useOptimisticLike({
    setItems: setNewsItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId,
    targetType: 'news',
  });

  const { incrementWithApi: incrementViewsCount } = useOptimisticCounter({
    items: newsItems,
    setItems: setNewsItems,
    countField: 'viewsCount',
    updateFn: updateNewsViewsCountApi,
  });

  const updateCommentsCount = useOptimisticCommentCount(setNewsItems);

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

  const news = useNormalizedData({
    items: newsItems,
    normalizeFn: normalizeNews,
  });

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
