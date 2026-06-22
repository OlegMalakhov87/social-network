/**
 * Преобразует пост из API в формат компонентов.
 * @param {Object} post — пост с включёнными likes и author
 * @param {number|null} currentUserId — id текущего пользователя
 * @param {string|null} friendshipStatus — статус дружбы для проверки видимости
 * @returns {Object}
 */
export function normalizePost(post, currentUserId, friendshipStatus) {
  return {
    ...post,
    text: post.message,
    createdAt: post.createdAt,
    likesCount: post.likes?.length ?? 0,
    isLiked: post.likes?.some((like) => like.userId === currentUserId) ?? false,
    comments: post.comments || [],
    commentsCount: post.commentsCount ?? post.comments?.length ?? 0,
  };
}
