import { useCallback, useMemo, useRef, useState } from 'react';
import {
  addCommentApi,
  deleteCommentApi,
  editCommentApi,
  fetchCommentsApi,
  normalizeComment,
} from '../../../entities/comment';
import { addLike, deleteLike } from '../../../entities/like';
import { SORT_OPTIONS } from '../../../shared/config';
import { useAbortableRequest } from '../../../shared/hooks';
import { sortByData } from '../../../shared/lib';

/**
 * Хук для получения комментариев с бесконечным скроллом.
 *
 * @param {string|null} targetType - тип цели (Post, News, Comment)
 * @param {number|null} targetId - ID цели
 * @param {number|null} currentUserId - ID текущего пользователя
 * @param {Function} onChange - колбэк для обновления счётчика комментариев
 * @param {string} [sortKey] - ключ сортировки
 * @returns {{ comments: Array, isLoading: boolean, hasMore: boolean, error: string|null, currentUserId: number|null, handleAddComment: Function, handleEditComment: Function, handleDeleteComment: Function, toggleLikeComment: Function, loadMore: Function, refetch: Function }}
 */
export function useFetchComments(
  targetType,
  targetId,
  currentUserId,
  onChange,
  sortKey
) {
  const loadMoreControllerRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [rawComments, setRawComments] = useState([]);

  /**
   * Запрос комментариев с сервера
   * @param {AbortSignal} signal - сигнал отмены запроса
   */
  const {
    isLoading,
    error,
    execute: fetchComments,
  } = useAbortableRequest(
    async (signal) => {
      if (!targetType || !targetId) {
        return { comments: [], pagination: { hasMore: false } };
      }
      const data = await fetchCommentsApi(targetType, targetId, 1, { signal });
      const comments = Array.isArray(data?.comments) ? data.comments : [];
      return {
        comments,
        pagination: data.pagination || { hasMore: false },
      };
    },
    [targetType, targetId],
    {
      initialData: { comments: [], pagination: { hasMore: false } },
      onSuccess: (data) => {
        setRawComments(data.comments);
        setHasMore(data.pagination?.hasMore ?? false);
        setPage(1);
      },
    }
  );

  /**
   * Загрузка следующей страницы комментариев.
   */
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    if (!targetType || !targetId) return;

    // Отменяем предыдущий loadMore
    loadMoreControllerRef.current?.abort();
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;

    const nextPage = page + 1;
    try {
      const data = await fetchCommentsApi(targetType, targetId, nextPage, {
        signal: loadMoreControllerRef.current.signal,
      });
      if (loadMoreControllerRef.current.signal.aborted) return;

      const comments = Array.isArray(data?.comments) ? data.comments : [];
      setRawComments((prev) => [...prev, ...comments]);
      setPage(nextPage);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Ошибка загрузки комментариев:', err);
    }
  }, [targetType, targetId, page, isLoading, hasMore]);

  
  /** Нормализация и сортировка комментариев */
  const comments = useMemo(() => {
    if (!Array.isArray(rawComments)) return [];
    const normalized = rawComments.map((raw) =>
      normalizeComment(raw, currentUserId)
    );
    const sortConfig = SORT_OPTIONS[sortKey];
    if (!sortConfig) return normalized;
    return sortByData(normalized, sortConfig, 'comments');
  }, [rawComments, currentUserId, sortKey]);


  /** Добавление комментария
   * @param {string} content - текст комментария
   */
  const handleAddComment = useCallback(
    async (content) => {
      if (!currentUserId || !content) return false;
      try {
        const newComment = await addCommentApi(targetType, targetId, content);
        setRawComments((prev) => [newComment, ...prev]);
        onChange?.(+1);
        return true;
      } catch (error) {
        console.error('Ошибка добавления комментария:', error);
        return false;
      }
    },
    [currentUserId, targetType, targetId, onChange]
  );

  /** Редактирование комментария
   * @param {number} commentId - ID комментария
   * @param {string} editText - текст комментария
   */
  const handleEditComment = useCallback(
    async (commentId, editText) => {
      if (!currentUserId || !editText) return false;
      try {
        await editCommentApi(commentId, editText, targetType, targetId);
        setRawComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, content: editText } : c
          )
        );
        return true;
      } catch (error) {
        console.error('Ошибка обновления комментария:', error);
        return false;
      }
    },
    [currentUserId, targetType, targetId]
  );

  /** Удаление комментария
   * @param {number} commentId - ID комментария
   */
  const handleDeleteComment = useCallback(
    async (commentId) => {
      if (!currentUserId || !commentId) return false;
      try {
        await deleteCommentApi(commentId);
        setRawComments((prev) => prev.filter((c) => c.id !== commentId));
        onChange?.(-1);
        return true;
      } catch (error) {
        console.error('Ошибка удаления комментария:', error);
        return false;
      }
    },
    [currentUserId, onChange]
  );

  /** Оптимистичный лайк / дизлайк
   * @param {number} commentId - ID комментария
   * @param {boolean} currentlyLiked - текущее состояние (лайкнут или нет)
   */
  const toggleLikeComment = useCallback(
    async (commentId, currentlyLiked) => {
      const userId = currentUserId;
      if (!userId) return;

      // Оптимистичное обновление
      setRawComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: currentlyLiked
                  ? (comment.likes || []).filter(
                      (like) => like.userId !== userId
                    )
                  : [...(comment.likes || []), { userId }],
              }
            : comment
        )
      );

      try {
        if (currentlyLiked) {
          await deleteLike('Comment', commentId);
        } else {
          await addLike('Comment', commentId);
        }
      } catch (err) {
        // Откат
        setRawComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: currentlyLiked
                    ? [...(comment.likes || []), { userId }]
                    : (comment.likes || []).filter(
                        (like) => like.userId !== userId
                      ),
                }
              : comment
          )
        );
        console.error('Ошибка лайка комментария:', err);
      }
    },
    [currentUserId]
  );

  return {
    comments,
    isLoading,
    hasMore,
    error,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    toggleLikeComment,
    loadMore,
    refetch: fetchComments,
  };
}
