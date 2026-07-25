import { useCallback } from 'react';
import { selectUser } from '../../../app/providers/slices/auth/authSelectors';
import {
  clearChatApi,
  hideMessageApi,
  sendMessageApi,
  updateMessageApi,
} from '../../../entities/dialog';
import { useNotify } from '../../../shared/hooks';

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
  const currentUser = selectUser();
  const notify = useNotify();

  /**
   * Отправить сообщение партнёру (оптимистично).
   * @param {number} partnerId – ID получателя
   * @param {string} text – текст сообщения
   */
  const sendMessage = useCallback(
    async (partnerId, text) => {
      if (!currentUser?.id || !text) return;
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        message: text,
        senderId: currentUser?.id,
        receiverId: partnerId,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      addOptimistic?.(optimisticMsg);
      try {
        const result = await sendMessageApi(partnerId, text.trim());
        notify.success('send');
        // Заменяем временное сообщение реальным
        replaceOptimistic?.(tempId, result);
        refetchDialogs?.();
      } catch (error) {
        // Удаляем временное сообщение при ошибке
        replaceOptimistic?.(tempId, null);
        console.error('Ошибка отправки сообщения:', error);
        notify.error('send');
      }
    },
    [currentUser?.id, addOptimistic, replaceOptimistic, refetchDialogs, notify]
  );

  /**
   * Скрыть сообщение от текущего пользователя (оптимистично).
   * @param {number} messageId – ID сообщения
   */
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!messageId) return;
      removeOptimistic(messageId);
      try {
        await hideMessageApi(messageId);
        refetchDialogs?.();
        notify.success('delete');
      } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
        notify.error('delete');
      }
    },
    [removeOptimistic, refetchDialogs, notify]
  );

  /**
   * Редактировать своё сообщение (оптимистично).
   * @param {number} messageId – ID сообщения
   * @param {string} newText – новый текст
   */
  const updateMessage = useCallback(
    async (messageId, newText) => {
      if (!newText.trim()) return;
      updateMessageInState(messageId, {
        message: newText,
        isEdited: true,
        updatedAt: new Date().toISOString(),
      });
      try {
        await updateMessageApi(messageId, newText.trim());
        notify.success('edit');
      } catch (error) {
        console.error('Ошибка редактирования:', error);
        notify.error('edit');
      }
    },
    [updateMessageInState, notify]
  );

  /**
   * Очистить свой чат с пользователем (скрывает все сообщения от текущего пользователя).
   * @param {number} partnerId – ID собеседника
   */
  const clearChat = useCallback(
    async (partnerId) => {
      try {
        await clearChatApi(partnerId);
        refetchMessages?.();
        refetchDialogs?.();
        notify.success('delete');
      } catch (err) {
        console.error('Ошибка очистки чата:', err);
        notify.error('delete');
      }
    },
    [refetchMessages, refetchDialogs, notify]
  );

  /**
   * Отправить расшаренную сущность.
   * @param {number} partnerId – ID получателя
   */
  const sendSharedEntity = useCallback(
    async (partnerId) => {
      if (!currentUser?.id) return;
      const sharedEntity = getSharedEntity();
      if (!sharedEntity) return;
      try {
        await sendMessageApi(partnerId, sharedEntity);
        notify.success('send');
      } catch (error) {
        console.error('Ошибка отправки расшаренной сущности:', error);
        notify.error('send');
      } finally {
        clearSharedEntity();
      }
    },
    [currentUser?.id, notify, getSharedEntity, clearSharedEntity]
  );

  return {
    sendMessage,
    deleteMessage,
    updateMessage,
    sendSharedEntity,
    clearChat,
  };
};
