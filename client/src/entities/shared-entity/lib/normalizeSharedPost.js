/**
 * Нормализует объект поста в объект SharedEntityCard.
 *
 * @param {Object} post - объект поста.
 * @returns {Object} - объект нормализованного поста.
 */
export const normalizeSharedPost = (post) => ({
  id: post.id,

  type: 'post',

  author: post.author || null,

  title: post.title || null,

  text: post.text || null,

  mediaUrl: post.mediaUrl || null,

  mediaType: post.type || null,

  date: post.date || null,

  stats: {
    likesCount: post.likesCount ?? 0,
    commentsCount: post.commentsCount ?? 0,
  },
});
