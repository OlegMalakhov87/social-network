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
 * Отправляет, изменяет и скрывает сообщения и очищает чат.
 *
 * @param {Function} addOptimistic - Добавляет временное сообщение
 * @param {Function} replaceOptimistic - Заменяет временное сообщение
 * @param {Function} removeOptimistic - Удаляет сообщение из списка
 * @param {Function} updateMessageInState - Обновляет поля сообщения
 * @param {Function} refetchDialogs - Повторяет загрузку диалогов
 * @param {Function} refetchMessages - Повторяет загрузку сообщений
 * @param {Function} getSharedEntity - Читает сохранённую сущность
 * @param {Function} clearSharedEntity - Удаляет сохранённую сущность
 * @returns {{
 *   sendMessage: Function,
 *   deleteMessage: Function,
 *   updateMessage: Function,
 *   sendSharedEntity: Function,
 *   clearChat: Function
 * }} Действия над сообщениями
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
   * Отправляет сообщение и показывает его до ответа сервера.
   *
   * @param {number} partnerId - Идентификатор получателя
   * @param {string} content - Текст сообщения
   * @returns {Promise<boolean>} Результат отправки
   */
  const sendMessage = useCallback(
    async (partnerId, content) => {
      if (!currentUserId || !content) return false;

      const tempId = `temp-${crypto.randomUUID()}`;

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

        replaceOptimistic?.(tempId, result);
        refetchDialogs?.();
        return true;
      } catch (error) {
        // Удаляет временное сообщение, если отправка не удалась.
        replaceOptimistic?.(tempId, null);
        throw parseApiError(error, 'Ошибка отправки сообщения');
      }
    },
    [currentUserId, addOptimistic, replaceOptimistic, refetchDialogs]
  );

  /**
   * Скрывает сообщение у текущего пользователя.
   *
   * @param {number} messageId - Идентификатор сообщения
   * @returns {Promise<boolean>} Результат скрытия
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
   * Изменяет текст своего сообщения.
   *
   * @param {number} messageId - Идентификатор сообщения
   * @param {string} content - Новый текст
   * @returns {Promise<boolean>} Результат изменения
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
   * Скрывает все сообщения чата у текущего пользователя.
   *
   * @param {number} partnerId - Идентификатор собеседника
   * @returns {Promise<boolean>} Результат очистки
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
   * Отправляет ранее сохранённую сущность.
   *
   * @param {number} partnerId - Идентификатор получателя
   * @returns {Promise<boolean>} Результат отправки
   */
  const sendSharedEntity = useCallback(
    async (partnerId) => {
      if (!currentUserId || !partnerId) return false;

      const sharedEntity = getSharedEntity?.();

      if (!sharedEntity) return false;

      const tempId = `temp-${crypto.randomUUID()}`;

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
        clearSharedEntity?.();
        return true;
      } catch (error) {
        replaceOptimistic?.(tempId, null);
        throw parseApiError(error, 'Ошибка отправки сообщения');
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
