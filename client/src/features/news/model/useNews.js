import { selectUser } from '../../../app/providers/slices/auth/authSelectors';
import { addLike, deleteLike } from '../../../entities/like';
import {
  addNewsApi,
  deleteNewsApi,
  fetchNewsApi,
  normalizeNews,
  updateNewsApi,
  updateNewsViewCount,
} from '../../../entities/news';
import { apiFetchItems } from '../../../shared/api';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
  useOptimisticCommentCount,
  useOptimisticCounter,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';

/**
 * Хук для получения и фильтрации новостей с бесконечным скроллом.
 *
 * @param {Object} params - Параметры
 * @param {string} params.filter - Фильтр
 * @param {string} params.searchQuery - Поисковый запрос
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {Object} - Результат
 * @returns {Array} news - Массив с нормализованными новостями
 * @returns {Object} currentUser - Текущий пользователь
 * @returns {boolean} hasMore - Есть ли еще страницы для загрузки
 * @returns {boolean} isLoading - общая загрузка данных
 * @returns {boolean} isLoadingMore - Загрузка следующей страницы
 * @returns {Error} error - Ошибка
 * @returns {Function} loadMore - Загрузить следующую страницу
 * @returns {Function} refetch - Перезагрузить данные (загрузить первую страницу)
 * @returns {Function} addNews - Добавить новость
 * @returns {Function} editNews - Редактировать новость
 * @returns {Function} deleteNews - Удалить новость
 * @returns {Function} toggleLike - Переключить лайк (лайк/дизлайк)
 * @returns {Function} incrementView - Увеличить счётчик просмотров
 * @returns {Function} updateCommentCount - Обновить счётчик комментариев
 */
export function useNews({ filter, searchQuery, sortKey } = {}) {
  const currentUser = selectUser();
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
        params: { filter, searchQuery, page, limit },
        signal,
      });
    },
    deps: [filter, searchQuery, sortKey],
    options: {
      autoFetch: true,
      onSuccess: () => notify.success('load'),
      onError: () => notify.error('load'),
    },
  });

  /** Оптимистичный лайк. */
  const toggleLike = useOptimisticLike({
    setItems: setNewsItems,
    addLikeFn: addLike,
    deleteLikeFn: deleteLike,
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

  /** Нормализация и сортировка новостей. */
  const news = useNormalizedData({
    items: newsItems,
    entityType: 'news',
    sortKey,
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
}
