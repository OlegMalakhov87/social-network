/**
 * Преобразует сырой комментарий с сервера в формат для CommentCard.
 *
 * @param {Object} raw - один комментарий из ответа API (с author и likes)
 * @param {number|null} currentUserId - id текущего пользователя
 * @returns {Object} - нормализованный комментарий
 */
export const normalizeComment = (raw, currentUserId) => {
  return {
    comment: {
      id: raw.id,
      userId: raw.userId,
      targetType: raw.targetType,
      targetId: raw.targetId,
      content: raw.content,
      date: raw.updatedAt ?? raw.createdAt,

      author: raw.author,

      likesCount: raw.likesCount ?? raw.likes?.length ?? 0,
      isLiked:
        raw.likes?.some((like) => like.userId === currentUserId) ?? false,
    },
  };
};
