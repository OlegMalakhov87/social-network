/**
 * Преобразует комментарий с сервера в формат CommentsList / Comment.
 */
export const normalizeComment = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    userId: raw.userId,
    targetType: raw.targetType,
    targetId: raw.targetId,
    text: raw.text,
    isEdited: raw.isEdited,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    author: raw.author,
    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,
  };
};
