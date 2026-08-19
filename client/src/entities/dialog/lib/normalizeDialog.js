/**
 * Диалог из GET /messages/dialogs (interlocutor + lastMessage).
 */
export const normalizeDialog = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  const user = raw.interlocutor ?? raw.user ?? null;
  const last = raw.lastMessage;

  return {
    user,
    unreadCount: raw.unreadCount ?? 0,
    lastMessage: last
      ? {
          id: last.id,
          content: last.content ?? last.text ?? '',
          text: last.text ?? last.content ?? '',
          date: last.date ?? last.createdAt,
          createdAt: last.createdAt ?? last.date,
          isRead: last.isRead,
          isOwn: last.isOwn,
        }
      : null,
  };
};
