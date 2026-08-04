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

/**
 * Хук для получения и фильтрации новостей с бесконечным скроллом.
 *
 * @param {string} filter - Фильтр
 * @param {string} searchQuery - Поисковый запрос
 * @param {string} sortKey - Ключ сортировки
 * @returns {Object} - объект с данными о новостях
 */

export const useNews = (filter, searchQuery, sortKey) => {
  const currentUser = useSelector(selectUser);
  const notify = useNotify('news');

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
      if (!filter && !searchQuery) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchNewsApi, {
        params: { filter, q: searchQuery, page, limit, sortKey },
        signal,
      });
    },
    deps: [filter, searchQuery, sortKey],
    onSuccess: () => notify.success('load'),
    onError: () => notify.error('load'),
  });

  /** Оптимистичный лайк. */
  const toggleLike = useOptimisticLike({
    setItems: setNewsItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: currentUser?.id,
    targetType: 'news',
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
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

  /** Оптимистичный мутации (CRUD). */
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
    userId: currentUser?.id,
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
