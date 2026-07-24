/**
 * Преобразует сырой объект новости с сервера в формат для NewsCard.
 *
 * @param {Object} raw - новость из ответа API
 * @param {number|null} currentUserId - ID текущего пользователя
 * @returns {Object} - нормализованная новость
 */
export const normalizeNews = (raw, currentUserId) => {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    date: raw.date,
    author: raw.author,
    category: raw.category,
    type: raw.type,
    source: raw.source,
    mediaUrl: raw.mediaUrl,
    viewsCount: raw.viewsCount ?? 0,

    likesCount: raw.likesCount ?? raw.likes?.length ?? 0,
    isLiked: raw.likes?.some((like) => like.userId === currentUserId) ?? false,

    comments: raw.comments || [],
    commentsCount: raw.commentsCount ?? raw.comments?.length ?? 0,
  };
};
