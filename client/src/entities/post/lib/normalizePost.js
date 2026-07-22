/**
 * Преобразует пост из API в формат компонентов.
 *
 * @param {Object} post - пост с включёнными likes и author
 * @param {number|null} currentUserId - id текущего пользователя
 * @returns {Object} - нормализованный пост
 */
export const normalizePost = (post, currentUserId) => {
  return {
    ...post,
    text: post.message,
    createdAt: post.createdAt,
    likesCount: post.likes?.length ?? 0,
    isLiked: post.likes?.some((like) => like.userId === currentUserId) ?? false,
    comments: post.comments || [],
    commentsCount: post.commentsCount ?? post.comments?.length ?? 0,
  };
};
