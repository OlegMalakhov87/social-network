/**
 * Нормализация списка диалогов.
 *
 * @param {Object} raw - сырой список диалогов
 * @returns {Object} - нормализованный список диалогов
 */
export const normalizeDialogs = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  const user = raw.user;
  const unreadCount = raw.unreadCount ?? 0;
  const last = raw.lastMessage;

  return {
    user,
    unreadCount,
    lastMessage: last
      ? {
          id: last.id,
          content: last.content,
          createdAt: last.createdAt,
          isRead: last.isRead ?? false,
          isOwn: last.isOwn ?? false,
        }
      : null,
  };
};
