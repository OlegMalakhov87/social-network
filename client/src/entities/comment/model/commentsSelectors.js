import { createSelector } from '@reduxjs/toolkit';

/**
 * Селектор комментариев с лайками для конкретной сущности.
 * @param {Object} state - глобальный стейт Redux
 * @param {string} targetType - тип сущности ('Post', 'Video', 'Music'...)
 * @param {number} targetId - ID сущности
 * @param {number} currentUserId - ID текущего пользователя
 * @returns {Array<{comment, likesCount, isLiked}>} обогащённые комментарии
 */
export const selectCommentsByTarget = createSelector(
  [
    (state) => state.comments?.commentsData || [],
    (state) => state.likes?.likesData || [],
    (_, targetType) => targetType,
    (_, __, targetId) => Number(targetId),
    (_, __, ___, currentUserId) => Number(currentUserId),
  ],
  (comments, likes, targetType, targetIdNum, currentUserIdNum) => {
    if (!targetType || isNaN(targetIdNum)) return [];

    const targetComments = comments.filter(
      (c) => c.targetType === targetType && c.targetId === targetIdNum
    );

    return targetComments.map((comment) => ({
      comment,
      likesCount: likes.filter(
        (like) => like.targetType === 'Comment' && like.targetId === comment.id
      ).length,
      isLiked: likes.some(
        (like) =>
          like.targetType === 'Comment' &&
          like.targetId === comment.id &&
          like.userId === currentUserIdNum
      ),
    }));
  }
);

/**
 * Селектор пользователя по ID с fallback-объектом.
 * @param {Object} state
 * @param {number} userId
 * @returns {Object} { id, name, photoUrl, isVerified }
 */
export const selectUserById = createSelector(
  [
    (state) => state.users?.usersData || [],
    (state) => state.auth?.user || null,
    (_, userId) => Number(userId),
  ],
  (users, currentUser, userIdNum) => {
    if (isNaN(userIdNum) || userIdNum <= 0) {
      return { id: userIdNum, name: 'Пользователь', photoUrl: '/userPhoto.jpg', isVerified: false };
    }

    const foundUser = users.find((u) => u.id === userIdNum);
    if (!foundUser && currentUser && currentUser.id === userIdNum) {
      return {
        ...currentUser,
        name: currentUser.name || 'Вы',
        photoUrl: currentUser.photoUrl || '/userPhoto.jpg',
      };
    }

    return (
      foundUser || {
        id: userIdNum,
        name: 'Пользователь',
        photoUrl: '/userPhoto.jpg',
        isVerified: false,
      }
    );
  }
);
