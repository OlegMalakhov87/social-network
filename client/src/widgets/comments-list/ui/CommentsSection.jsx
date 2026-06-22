import { useFetchComments } from '../../../features/comments';
import { CommentsList } from '../../../entities/comment';
import React from 'react';

/**
 * Виджет секции комментариев для конкретной сущности (пост, трек, видео...).
 * @param {Object} props
 * @param {string} props.targetType - тип сущности (Post, Video, Track...)
 * @param {number} props.targetId - ID сущности
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.updateCommentCount - обработчик для оптимистического обновления счетчика комментариев по типу сущности
 * @param {Function} props.closeComments - колбэк закрытия
 */
export const CommentsSection = ({
  targetType,
  targetId,
  currentUser,
  updateCommentCount,
  closeComments,
}) => {
  const {
    comments: fetchedComments,
    isLoading: isFetchLoading,
    error: errorComments,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    toggleLikeComment,
  } = useFetchComments(targetType, targetId, updateCommentCount);

  return (
    <div id="comments-section">
      <CommentsList
        comments={fetchedComments}
        isLoading={isFetchLoading}
        currentUser={currentUser}
        onCommentSubmit={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        toggleLikeComment={toggleLikeComment}
        onCloseComments={closeComments}
        error={errorComments}
      />
    </div>
  );
};
