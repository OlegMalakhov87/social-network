import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addLike, deleteLike } from '../../../app/providers/slices/likesSlice';
import {
  addComment,
  editComment,
  deleteComment,
  updateNewCommentText,
} from '../../../entities/comment';

/**
 * Хук действий с комментариями.
 * Предоставляет обработчики добавления, редактирования, удаления и лайков.
 * @returns {Object} методы и состояния
 */
export const useCommentsActions = () => {
  const dispatch = useDispatch();
  const commentText = useSelector((state) => state.comments?.newCommentText || '');
  const currentUser = useSelector((state) => state.auth?.user);

  /**
   * Создаёт обработчик добавления комментария для конкретной цели.
   * @param {string} targetType - тип цели ('Post', 'Video' и т.д.)
   * @param {number} targetId - ID цели
   * @returns {Function} обработчик события
   */
  const getAddCommentHandler = useCallback(
    (targetType, targetId) => () => {
      if (!commentText.trim() || !currentUser || !targetType || !targetId) return;
      dispatch(
        addComment({
          content: commentText,
          userId: currentUser.id,
          targetType,
          targetId,
        })
      );
    },
    [dispatch, currentUser, commentText]
  );

  /** Редактирование комментария */
  const handleEditComment = useCallback(
    (id, newText) => {
      if (!currentUser) return;
      dispatch(editComment({ id, newText, currentUser }));
    },
    [dispatch, currentUser]
  );

  /** Удаление комментария */
  const handleDeleteComment = useCallback(
    (commentId) => {
      if (!currentUser) return;
      dispatch(deleteComment({ commentId, currentUser }));
    },
    [dispatch, currentUser]
  );

  /** Лайк комментария */
  const handleLikeComment = useCallback(
    (commentId) => {
      if (!currentUser?.id || !commentId) return;
      dispatch(
        addLike({
          currentUserId: currentUser.id,
          targetId: commentId,
          targetType: 'Comment',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  /** Дизлайк комментария */
  const handleUnlikeComment = useCallback(
    (commentId) => {
      if (!currentUser?.id || !commentId) return;
      dispatch(
        deleteLike({
          currentUserId: currentUser.id,
          targetId: commentId,
          targetType: 'Comment',
        })
      );
    },
    [dispatch, currentUser?.id]
  );

  /** Изменение текста нового комментария */
  const handleTextChange = useCallback(
    (e) => dispatch(updateNewCommentText(e.target.value)),
    [dispatch]
  );

  return {
    commentText,
    getAddCommentHandler,
    handleEditComment,
    handleDeleteComment,
    handleLikeComment,
    handleUnlikeComment,
    handleTextChange,
  };
};
