import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  sendMessageApi,
  hideMessageApi,
  editMessageApi,
  clearChatApi,
} from '../../../entities/dialog';
import { fetchPostById } from '../../../entities/post';

/**
 * Хук действий с сообщениями – предоставляет функции отправки, удаления (скрытия),
 * редактирования, очистки чата и отправки общего поста.
 *
 * @param {string|null} sharedPostId – ID поста, которым делятся (из sessionStorage)
 * @param {Function} addOptimistic – добавить временное сообщение в стейт
 * @param {Function} replaceOptimistic – заменить временное сообщение реальным
 * @param {Function} removeOptimistic – удалить сообщение из стейта (оптимистично)
 * @param {Function} updateMessageInState – обновить поля сообщения (например, после редактирования)
 * @param {Function} refetchDialogs – перезапросить список диалогов
 * @param {Function} refetchMessages – перезапросить список сообщений текущего диалога
 * @returns {{
 *   sendMessage: Function,
 *   deleteMessage: Function,
 *   editMessage: Function,
 *   sendSharedPost: Function,
 *   clearChat: Function
 * }}
 */
export const useDialogsActions = (
  sharedPostId,
  addOptimistic,
  replaceOptimistic,
  removeOptimistic,
  updateMessageInState,
  refetchDialogs,
  refetchMessages
) => {
  const currentUserId = useSelector((state) => state.auth.user?.id);

  /**
   * Отправить сообщение партнёру (оптимистично).
   * @param {number} partnerId – ID получателя
   * @param {string} text – текст сообщения
   */
  const sendMessage = useCallback(
    async (partnerId, text) => {
      if (!currentUserId || !text) return;
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        message: text,
        senderId: currentUserId,
        receiverId: partnerId,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      addOptimistic?.(optimisticMsg);
      try {
        const result = await sendMessageApi(partnerId, text.trim());
        // Заменяем временное сообщение реальным
        replaceOptimistic?.(tempId, result);
        refetchDialogs?.();
      } catch (error) {
        // Удаляем временное сообщение при ошибке
        replaceOptimistic?.(tempId, null);
        console.error('Ошибка отправки:', error);
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
      if (!messageId) return;
      removeOptimistic(messageId);
      try {
        await hideMessageApi(messageId);
        refetchDialogs?.();
      } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
      }
    },
    [removeOptimistic, refetchDialogs]
  );

  /**
   * Редактировать своё сообщение (оптимистично).
   * @param {number} messageId – ID сообщения
   * @param {string} newText – новый текст
   */
  const editMessage = useCallback(
    async (messageId, newText) => {
      if (!newText.trim()) return;
      updateMessageInState(messageId, {
        message: newText,
        isEdited: true,
        updatedAt: new Date().toISOString(),
      });
      try {
        await editMessageApi(messageId, newText.trim());
      } catch (error) {
        console.error('Ошибка редактирования:', error);
      }
    },
    [updateMessageInState]
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
      } catch (err) {
        console.error('Ошибка очистки чата:', err);
      }
    },
    [refetchMessages, refetchDialogs]
  );

  /**
   * Отправить пост в виде структурированного сообщения (шеринг).
   * @param {number} userId – ID получателя
   */
  const sendSharedPost = useCallback(
    async (userId) => {
      if (!sharedPostId || !currentUserId) return;
      try {
        const post = await fetchPostById(sharedPostId);
        const payload = {
          type: 'sharedPost',
          postId: post.id,
          message: post.message,
          mediaUrl: post.mediaUrl,
          postType: post.postType,
          author: post.author,
          isLiked: post.likes?.some((like) => like.userId === currentUserId) ?? false,
          likesCount: post.likes?.length ?? 0,
          commentsCount: post.comments?.length ?? 0,
          createdAt: post.createdAt,
        };
        await sendMessageApi(userId, JSON.stringify(payload));
        sessionStorage.removeItem('sharedPostId');
        refetchMessages?.();
        refetchDialogs?.();
      } catch (err) {
        console.error('Ошибка при отправке поста:', err);
      }
    },
    [sharedPostId, currentUserId, refetchDialogs, refetchMessages]
  );

  return {
    sendMessage,
    deleteMessage,
    editMessage,
    sendSharedPost,
    clearChat,
  };
};
