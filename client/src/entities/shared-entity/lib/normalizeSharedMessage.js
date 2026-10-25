/**
 * Приводит сообщение к карточке общей сущности.
 *
 * @param {Object} message - Сообщение
 * @returns {Object} Карточка общей сущности
 */
export const normalizeSharedMessage = (message) => ({
  id: message.id,
  type: 'message',
  author: message.author || null,
  title: message.title || null,
  mediaUrl: message.mediaUrl || null,
  text: message.content || null,
  date: (message.updatedAt ?? message.createdAt) || null,
  stats: {
    likesCount: message.likesCount ?? 0,
  },
});
