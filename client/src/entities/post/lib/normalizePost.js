/**
 * Преобразует пост из API в формат компонентов.
 *
 * @param {Object} raw - пост с включёнными likes и author
 * @param {number|null} currentUserId - id текущего пользователя
 * @returns {Object} - нормализованный пост
 */
export const normalizePost = (raw, currentUserId) => {
  return {
    id: raw.id,
    userId: raw.userId,
    text: raw.text,
    mediaUrl: raw.mediaUrl,
    visibility: raw.visibility,
    type: raw.type,
    date: raw.updatedAt ?? raw.createdAt,

    author: raw.author,

    likesCount: raw.likesCount ?? raw.likes?.length ?? 0,
    isLiked: raw.likes?.some((like) => like.userId === currentUserId) ?? false,

    comments: raw.comments || [],
    commentsCount: raw.commentsCount ?? raw.comments?.length ?? 0,
  };
};
