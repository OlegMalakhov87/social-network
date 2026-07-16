/**
 * Преобразует сырой комментарий с сервера в формат для CommentCard.
 * @param {Object} raw – один комментарий из ответа API (с author и likes)
 * @param {number|null} currentUserId – id текущего пользователя
 * @returns {Object} { comment, author }
 */
export function normalizeComment(raw, currentUserId) {
  const author = raw.author || {
    id: raw.userId,
    name: 'Пользователь',
    photoUrl: '/user.png',
    isVerified: false,
  };

  return {
    comment: {
      id: raw.id,
      userId: raw.userId,
      targetType: raw.targetType,
      targetId: raw.targetId,
      content: raw.content,
      date: raw.createdAt,
      likesCount: raw.likes?.length ?? 0,
      isLiked:
        raw.likes?.some((like) => like.userId === currentUserId) ?? false,
    },
    author,
  };
}
