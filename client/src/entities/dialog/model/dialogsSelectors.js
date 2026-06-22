import { createSelector } from '@reduxjs/toolkit';

export const selectDialogsData = (state) => state.dialogs?.dialogsData ?? [];
export const selectUsersData = (state) => state.users?.usersData ?? [];
export const selectCurrentUserId = (state) => state.auth?.user?.id ?? null;

// Получить список ID собеседников для текущего пользователя
export const selectDialogPartnerIds = createSelector(
  [selectDialogsData, selectCurrentUserId],
  (dialogs, currentUserId) => {
    if (!currentUserId) return [];
    return [
      ...new Set(
        dialogs
          .filter((d) => d.sender === currentUserId || d.receiver === currentUserId)
          .map((d) => (d.sender === currentUserId ? d.receiver : d.sender))
      ),
    ];
  }
);

// Получить пользователей, с которыми есть диалог
export const selectDialogPartners = createSelector(
  [selectUsersData, selectDialogPartnerIds, selectCurrentUserId],
  (users, partnerIds, currentUserId) => {
    return users.filter((user) => partnerIds.includes(user.id) && user.id !== currentUserId);
  }
);

// Последнее сообщение с пользователем ( функция для конкретного user)
export const getLastMessageForUser = (dialogs, userId, currentUserId) => {
  if (!Array.isArray(dialogs) || !userId || !currentUserId) return null;
  const messages = dialogs.filter(
    (msg) =>
      (msg.sender === userId && msg.receiver === currentUserId) ||
      (msg.sender === currentUserId && msg.receiver === userId)
  );
  if (!messages.length) return null;
  // Находим сообщение с самой поздней датой
  return messages.reduce((a, b) => (new Date(a.date) > new Date(b.date) ? a : b));
};
