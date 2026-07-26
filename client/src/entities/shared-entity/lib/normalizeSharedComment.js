/**
 * Нормализует объект комментария в объект SharedEntityCard.
 *
 * @param {Object} comment - объект комментария.
 * @returns {Object} - объект нормализованного комментария.
 */
export const normalizeSharedComment = (comment) => ({
  id: comment.id,

  type: 'comment',

  author: comment.author || null,

  title: comment.title || null,

  mediaUrl: comment.mediaUrl || null,

  text: comment.content || null,

  date: comment.date || null,

  stats: {
    likesCount: comment.likesCount ?? 0,
  },
});
