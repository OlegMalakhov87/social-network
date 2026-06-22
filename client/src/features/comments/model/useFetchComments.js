import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { addLike, deleteLike } from '../../../entities/like';
import {
  fetchComments,
  addCommentApi,
  editCommentApi,
  deleteCommentApi,
  normalizeComment,
} from '../../../entities/comment';

/**
 * Хук для получения комментариев к сущности с сервера.
 * @param {string|null} targetType
 * @param {number|null} targetId
 * @param {string} content
 * @returns {{ comments: Array, isLoading: boolean, error: string|null, handleAddComment: Function, handleEditComment: Function, handleDeleteComment: Function, refetch: Function }}
 */
export function useFetchComments(targetType, targetId, onChange) {
  const [rawComments, setRawComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.auth?.user);

  const fetch = useCallback(async () => {
    if (!targetType || !targetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchComments(targetType, targetId);
      setRawComments(data.comments || []);
    } catch (err) {
      setError(err.message);
      setRawComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleAddComment = useCallback(
    async (content) => {
      if (!currentUser?.id || !content) return false;
      try {
        await addCommentApi(targetType, targetId, content);
        fetch();
        onChange?.(+1);
        return true;
      } catch (error) {
        console.error('Ошибка добавления комментария:', error);
        return false;
      }
    },
    [currentUser?.id, targetType, targetId, onChange, fetch]
  );

  const handleEditComment = useCallback(
    async (commentId, editText) => {
      if (!currentUser?.id || !editText) return false;
      try {
        await editCommentApi(commentId, editText, targetType, targetId);
        fetch();
        return true;
      } catch (error) {
        console.error('Ошибка обновления комментария:', error);
        return false;
      }
    },
    [currentUser?.id, targetType, targetId, fetch]
  );

  const handleDeleteComment = useCallback(
    async (commentId) => {
      if (!currentUser?.id || !commentId) return false;
      try {
        await deleteCommentApi(commentId);
        fetch();
        onChange?.(-1);
        return true;
      } catch (error) {
        console.error('Ошибка удаления комментария:', error);
        return false;
      }
    },
    [currentUser?.id, onChange, fetch]
  );

  /**
   * Оптимистичный лайк / дизлайк
   * @param {number} commentId
   * @param {boolean} currentlyLiked — текущее состояние (лайкнут или нет)
   */
  const toggleLikeComment = useCallback(
    async (commentId, currentlyLiked) => {
      setRawComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes: currentlyLiked
                  ? (comment.likes || []).filter((like) => like.userId !== currentUser?.id)
                  : [...(comment.likes || []), { userId: currentUser?.id }],
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
        setRawComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: currentlyLiked
                    ? [...(comment.likes || []), { userId: currentUser?.id }]
                    : (comment.likes || []).filter((like) => like.userId !== currentUser?.id),
                }
              : comment
          )
        );
        console.error('Ошибка лайка новости:', err);
      }
    },
    [currentUser?.id]
  );

  const comments = (rawComments || []).map((raw) => normalizeComment(raw, currentUser?.id));

  return {
    comments,
    isLoading,
    error,
    currentUser,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    toggleLikeComment,
    refetch: fetch,
  };
}
