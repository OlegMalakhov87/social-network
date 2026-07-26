/**
 * Нормализует объект сообщения в объект SharedEntityCard.
 *
 * @param {Object} message - объект сообщения.
 * @returns {Object} - объект нормализованного сообщения.
 */
export const normalizeSharedMessage = (message) => ({
  id: message.id,

  type: 'message',

  author: message.author||null,

  title: message.title||null,

  mediaUrl: message.mediaUrl||null,

  text: message.text||null,

  date: (message.updateDate ?? message.createDate)||null,

  stats: {
    likesCount: message.likesCount ?? 0,
  },
});
