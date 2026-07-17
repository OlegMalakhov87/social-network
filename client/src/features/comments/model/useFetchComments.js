import {
  addCommentApi,
  deleteCommentApi,
  fetchCommentsApi,
  normalizeComment,
  updateCommentApi,
} from '../../../entities/comment';
import { addLike, deleteLike } from '../../../entities/like';
import { apiFetchItems } from '../../../shared/api';
import {
  useInfiniteScroll,
  useNormalizedData,
  useNotify,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';

/**
 * Хук для получения комментариев с бесконечным скроллом.
 *
 * @param {string|null} targetType - тип сущности (Post, News, Comment)
 * @param {number|null} targetId - ID сущности
 * @param {number|null} currentUserId - ID текущего пользователя
 * @param {Function} onChange - колбэк для обновления счётчика комментариев
 * @param {string} [sortKey] - ключ сортировки
 * @returns {{ comments: Array, isLoading: boolean, hasMore: boolean, error: string|null, toggleLike: Function, addComment: Function, updateComment: Function, deleteComment: Function, loadMore: Function, refetch: Function }}
 */
export function useFetchComments(
  targetType,
  targetId,
  currentUserId,
  onChange,
  sortKey
) {
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
        params: { targetType, targetId, page, limit },
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
    addLikeFn: addLike,
    deleteLikeFn: deleteLike,
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
    entityType: 'comments',
    sortKey,
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
}
