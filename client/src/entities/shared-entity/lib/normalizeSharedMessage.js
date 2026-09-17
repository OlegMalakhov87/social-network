/**
 * Нормализует объект сообщения в объект SharedEntityCard.
 *
 * @param {Object} message - объект сообщения.
 * @returns {Object} - объект нормализованного сообщения.
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
