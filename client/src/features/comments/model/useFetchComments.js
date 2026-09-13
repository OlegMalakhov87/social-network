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
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Хук для получения комментариев с бесконечным скроллом.
 *
 * @param {Object} params - параметры запроса
 * @param {string} params.targetType - тип сущности
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
        params: {
          page,
          limit,
          sortKey,
          targetType,
          targetId,
        },
        signal,
      });
    },
    deps: [targetType, targetId, sortKey],
  });

  /** Оптимистичный лайк. */
  const toggleLike = useOptimisticLike({
    setItems: setCommentsItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: currentUserId,
    targetType: 'comments',
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
      const res = await addCommentApi({
        targetType,
        targetId,
        text: data.text,
      });
      onChange?.(+1);
      return res?.comment ?? res;
    },

    editFn: async (commentId, data) => {
      const res = await updateCommentApi(commentId, {
        targetType,
        targetId,
        text: data.text,
      });
      return res?.comment ?? res;
    },

    deleteFn: async (commentId) => {
      const res = await deleteCommentApi(commentId);
      onChange?.(-1);
      return res?.comment ?? res;
    },
  });

  /** Нормализация комментариев. */
  const comments = useNormalizedData({
    items: commentsItems,
    normalizeFn: normalizeComment,
  });

  /** Возвращаем данные о комментариях. */
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
