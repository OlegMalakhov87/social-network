import { useMemo } from 'react';

import {
  addCommentApi,
  deleteCommentApi,
  fetchCommentsApi,
  normalizeComments,
  updateCommentApi,
} from '../../../entities/comment';
import { addLikeApi, deleteLikeApi } from '../../../entities/like';
import { useOnline } from '../../../features/users';
import {
  useInfiniteScroll,
  useNormalizedData,
  useOptimisticLike,
  useOptimisticMutation,
} from '../../../shared/hooks';
import { apiFetchItems } from '../../../shared/lib';

/**
 * Возвращает комментарии сущности и изменяет их локально.
 *
 * @param {Object} params - Параметры запроса
 * @param {string} params.targetType - Тип сущности
 * @param {number} params.targetId - Идентификатор сущности
 * @param {number} params.currentUserId - Идентификатор текущего пользователя
 * @param {Function} [params.onChange] - Обновляет счётчик комментариев
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {{
 *   comments: Array<Object>,
 *   toggleLike: Function,
 *   addComment: Function,
 *   updateComment: Function,
 *   deleteComment: Function,
 *   isLoading: boolean,
 *   isLoadingMore: boolean,
 *   hasMore: boolean,
 *   error: { message: string, fieldErrors?: Object }|null,
 *   loadMore: Function,
 *   refetch: Function
 * }} Комментарии и действия
 */
export const useFetchComments = ({
  targetType,
  targetId,
  currentUserId,
  onChange,
  sortKey,
}) => {
  const scrollDeps = useMemo(
    () => [targetType, targetId, sortKey, currentUserId],
    [targetType, targetId, sortKey, currentUserId]
  );

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
    /**
     * Загружает страницу комментариев.
     *
     * @param {Object} query - Параметры страницы
     * @param {number} query.page - Номер страницы
     * @param {number} query.limit - Размер страницы
     * @param {AbortSignal} query.signal - Сигнал отмены
     * @returns {Promise<{items: Array, hasMore: boolean}>|{items: Array, hasMore: boolean}} Страница комментариев
     */
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
    deps: scrollDeps,
  });

  const toggleLike = useOptimisticLike({
    setItems: setCommentsItems,
    addLikeFn: addLikeApi,
    deleteLikeFn: deleteLikeApi,
    currentUserId: currentUserId,
    targetType: 'comments',
  });

  const {
    add: addComment,
    edit: updateComment,
    remove: deleteComment,
  } = useOptimisticMutation({
    items: commentsItems,
    setItems: setCommentsItems,

    /**
     * Создаёт комментарий и увеличивает счётчик.
     *
     * @param {Object} data - Данные комментария
     * @param {string} data.text - Текст комментария
     * @returns {Promise<Object>} Созданный комментарий
     */
    addFn: async (data) => {
      const res = await addCommentApi({
        targetType,
        targetId,
        text: data.text.trim(),
      });
      onChange?.(+1);
      return res?.comment ?? res;
    },

    /**
     * Изменяет текст комментария.
     *
     * @param {number} commentId - Идентификатор комментария
     * @param {Object} data - Новые данные комментария
     * @param {string} data.text - Текст комментария
     * @returns {Promise<Object>} Изменённый комментарий
     */
    editFn: async (commentId, data) => {
      const res = await updateCommentApi(commentId, {
        targetType,
        targetId,
        text: data.text.trim(),
      });
      return res?.comment ?? res;
    },

    /**
     * Удаляет комментарий и уменьшает счётчик.
     *
     * @param {number} commentId - Идентификатор комментария
     * @returns {Promise<Object>} Ответ сервера
     */
    deleteFn: async (commentId) => {
      const res = await deleteCommentApi(commentId);
      onChange?.(-1);
      return res?.comment ?? res;
    },
  });

  const userIds = useMemo(
    () => commentsItems.map((comment) => comment?.author?.id),
    [commentsItems]
  );

  const onlineMap = useOnline(userIds);

  const enrichedData = useMemo(
    () =>
      commentsItems.map((comment) => ({
        ...comment,
        author: {
          ...comment.author,
          online: onlineMap.get(comment?.author?.id) ?? false,
        },
      })),
    [commentsItems, onlineMap]
  );

  const comments = useNormalizedData({
    items: enrichedData,
    normalizeFn: normalizeComments,
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
