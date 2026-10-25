/**
 * Приводит пост к карточке общей сущности.
 *
 * @param {Object} post - Пост
 * @returns {Object} Карточка общей сущности
 */
export const normalizeSharedPost = (post) => ({
  id: post.id,
  type: 'post',
  author: post.author || null,
  title: post.title || null,
  text: post.text || null,
  mediaUrl: post.postUrl || null,
  date: (post.updatedAt ?? post.createdAt) || null,
  stats: {
    likesCount: post.likesCount ?? 0,
    commentsCount: post.commentsCount ?? 0,
  },
});
