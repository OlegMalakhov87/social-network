import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectDialogsData, selectCurrentUserId } from '../../../entities/dialog';

/**
 * Хук получения сообщений с конкретным пользователем.
 * @param {Object} params
 * @param {number|null} params.partnerId - ID собеседника
 * @returns {{ messages: Array, currentUserId: number|null, isLoading: boolean }}
 */
export const useChatMessagesFilter = ({ partnerId }) => {
  const dialogs = useSelector(selectDialogsData);
  const currentUserId = useSelector(selectCurrentUserId);

  const messages = useMemo(() => {
    if (!partnerId || !currentUserId) return [];
    return dialogs.filter(
      (msg) =>
        (msg.sender === partnerId && msg.receiver === currentUserId) ||
        (msg.sender === currentUserId && msg.receiver === partnerId)
    );
  }, [dialogs, partnerId, currentUserId]);

  return { messages, currentUserId, isLoading: false };
};
