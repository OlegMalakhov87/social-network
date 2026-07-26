import {
  addCommentApi,
  deleteCommentApi,
  fetchCommentsApi,
  normalizeComment,
  updateCommentApi,
} from '../../../entities/comment';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Хук для получения комментариев с бесконечным скроллом.
 *
 * @param {Object} params - параметры запроса
 * @param {string} params.targetType - тип сущности (Post, News, Comment)
 * @param {number} params.targetId - ID сущности
 * @param {number} params.currentUserId - ID текущего пользователя
 * @param {Function} params.onChange - колбэк для обновления счётчика комментариев
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Object} - объект с данными о комментариях
 */
export const useFetchComments = ({
  targetType,
  targetId,
  currentUserId,
  onChange,
  sortKey,
}) => {
  const notify = useNotify('comments');

  /** Получение комментариев с бесконечным скроллом. */
  const {
    items: commentsItems,
    setItems: setCommentsItems,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useInfiniteScroll({
    fetchFn: ({ page, limit, signal }) => {
      if (!targetType || !targetId) {
        return { items: [], hasMore: false };
      }
      return apiFetchItems(fetchCommentsApi, {
        params: { targetType, targetId, page, limit, sortKey },
        signal,
      });
    },
    deps: [targetType, targetId, sortKey],
    onSuccess: () => notify.success('load'),
    onError: () => notify.error('load'),
  });

  /** Оптимистичный лайк. */
  const toggleLike = useOptimisticLike({
    setItems: setCommentsItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: currentUserId,
    targetType: 'comment',
    onSuccess: (action) => notify.success(action),
    onError: (action) => notify.error(action),
  });

  /** Оптимистичный мутации (CRUD). */
  const {
    add: addComment,
    edit: updateComment,
    remove: deleteComment,
  } = useOptimisticMutation({
    items: commentsItems,
    setItems: setCommentsItems,
    addFn: async (data) => {
      const res = await addCommentApi(data);
      onChange?.(+1);
      return res;
    },
    editFn: updateCommentApi,
    deleteFn: async (commentId) => {
      const res = await deleteCommentApi(commentId);
      onChange?.(-1);
      return res;
    },
    onSuccess: (action) => {
      notify.success(action);
    },
    onError: (action) => {
      notify.error(action);
    },
  });

  /** Нормализация и сортировка комментариев. */
  const comments = useNormalizedData({
    items: commentsItems,
    normalizeFn: normalizeComment,
    userId: currentUserId,
  });

  return {
    comments,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  };
};
