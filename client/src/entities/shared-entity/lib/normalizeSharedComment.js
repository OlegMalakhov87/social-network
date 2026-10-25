/**
 * Приводит комментарий к карточке общей сущности.
 *
 * @param {Object} comment - Комментарий
 * @returns {Object} Карточка общей сущности
 */
export const normalizeSharedComment = (comment) => ({
  id: comment.id,
  type: 'comment',
  author: comment.author || null,
  title: comment.title || null,
  mediaUrl: comment.mediaUrl || null,
  text: comment.text || null,
  date: (comment.updatedAt ?? comment.createdAt) || null,
  stats: {
    likesCount: comment.likesCount ?? 0,
  },
});
