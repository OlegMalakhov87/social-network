import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../entities/auth';
import {
  clearChatApi,
  hideMessageApi,
  sendMessageApi,
  updateMessageApi,
} from '../../../entities/dialog';
import { parseApiError } from '../../../shared/lib';

/**
 * Хук действий с сообщениями – предоставляет функции отправки, удаления (скрытия),
 * редактирования, очистки чата и отправки общей сущности.
 *
 * @param {Function} addOptimistic – добавить временное сообщение в стейт
 * @param {Function} replaceOptimistic – заменить временное сообщение реальным
 * @param {Function} removeOptimistic – удалить сообщение из стейта (оптимистично)
 * @param {Function} updateMessageInState – обновить поля сообщения (например, после редактирования)
 * @param {Function} refetchDialogs – перезапросить список диалогов
 * @param {Function} refetchMessages – перезапросить список сообщений текущего диалога
 * @param {Function} getSharedEntity – получить расшаренную сущность из sessionStorage
 * @param {Function} clearSharedEntity – очистить расшаренную сущность из sessionStorage
 * @returns {Object} - объект с функциями действий
 */
export const useDialogsActions = (
  addOptimistic,
  replaceOptimistic,
  removeOptimistic,
  updateMessageInState,
  refetchDialogs,
  refetchMessages,
  getSharedEntity,
  clearSharedEntity
) => {
  const currentUser = useSelector(selectUser);
  const currentUserId = currentUser?.id;

  /**
   * Отправить сообщение партнёру (оптимистично).
   * @param {number} partnerId – ID получателя
   * @param {string} text – текст сообщения
   */
  const sendMessage = useCallback(
    async (partnerId, content) => {
      if (!currentUserId || !content) return false;

      const tempId = `temp-${Date.now()}`;

      const optimisticMsg = {
        id: tempId,
        content: content.trim(),
        senderId: currentUserId,
        receiverId: partnerId,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      addOptimistic?.(optimisticMsg);

      try {
        const result = await sendMessageApi(partnerId, content.trim());

        // Заменяем временное сообщение реальным
        replaceOptimistic?.(tempId, result);
        refetchDialogs?.();
        return true;
      } catch (error) {
        // Удаляем временное сообщение при ошибке
        replaceOptimistic?.(tempId, null);
        throw parseApiError(error, 'Ошибка отправки сообщения');
      }
    },
    [currentUserId, addOptimistic, replaceOptimistic, refetchDialogs]
  );

  /**
   * Скрыть сообщение от текущего пользователя (оптимистично).
   * @param {number} messageId – ID сообщения
   */
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!messageId) return false;

      removeOptimistic?.(messageId);

      try {
        await hideMessageApi(messageId);

        refetchDialogs?.();
        return true;
      } catch (error) {
        refetchMessages?.();
        throw parseApiError(error, 'Ошибка удаления сообщения');
      }
    },
    [removeOptimistic, refetchMessages, refetchDialogs]
  );

  /**
   * Редактировать своё сообщение (оптимистично).
   * @param {number} messageId – ID сообщения
   * @param {string} newText – новый текст
   */
  const updateMessage = useCallback(
    async (messageId, content) => {
      if (!content || !messageId) return false;

      updateMessageInState(messageId, {
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date().toISOString(),
      });

      try {
        const result = await updateMessageApi(messageId, content.trim());

        replaceOptimistic?.(messageId, result);
        return true;
      } catch (error) {
        refetchMessages?.();
        throw parseApiError(error, 'Ошибка редактирования сообщения');
      }
    },
    [updateMessageInState, refetchMessages, replaceOptimistic]
  );

  /**
   * Очистить свой чат с пользователем (скрывает все сообщения от текущего пользователя).
   * @param {number} partnerId – ID собеседника
   */
  const clearChat = useCallback(
    async (partnerId) => {
      if (!partnerId) return false;

      try {
        await clearChatApi(partnerId);
        refetchMessages?.();
        refetchDialogs?.();
        return true;
      } catch (err) {
        refetchMessages?.();
        refetchDialogs?.();
        throw parseApiError(err, 'Ошибка очистки чата');
      }
    },
    [refetchMessages, refetchDialogs]
  );

  /**
   * Отправить расшаренную сущность.
   * @param {number} partnerId – ID получателя
   */
  const sendSharedEntity = useCallback(
    async (partnerId) => {
      if (!currentUserId || !partnerId) return false;

      const sharedEntity = getSharedEntity?.();

      if (!sharedEntity) return false;

      const tempId = `temp-${Date.now()}`;

      const optimisticMsg = {
        id: tempId,
        content: sharedEntity,
        senderId: currentUserId,
        receiverId: partnerId,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      addOptimistic?.(optimisticMsg);
      try {
        const result = await sendMessageApi(partnerId, sharedEntity);
        replaceOptimistic?.(tempId, result);
        return true;
      } catch (error) {
        replaceOptimistic?.(tempId, null);
        throw parseApiError(error, 'Ошибка отправки сообщения');
      } finally {
        clearSharedEntity?.();
      }
    },
    [
      currentUserId,
      getSharedEntity,
      clearSharedEntity,
      replaceOptimistic,
      addOptimistic,
    ]
  );

  return {
    sendMessage,
    deleteMessage,
    updateMessage,
    sendSharedEntity,
    clearChat,
  };
};
