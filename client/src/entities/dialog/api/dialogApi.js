import { DialogsListSchema, MessageSchema, MessagesListSchema } from '..';
import { api } from '../../../shared/api';
/**
 * Получить список диалогов
 * @param {Object} params
 * @param {number} params.page - номер страницы
 * @param {string} [params.q] - поисковый запрос
 * @param {number} params.limit - количество элементов на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<{dialogs: DialogsListSchema, pagination}} {dialogs, pagination}
 */
export const fetchDialogsApi = async ({ page, q, limit, signal }) => {
  const response = await api.get(`/messages/dialogs`, {
    params: {
      page,
      limit,
      q: q?.trim() || undefined,
    },
    signal,
  });

  return {
    dialogs: DialogsListSchema.parse(response.data?.dialogs),
    pagination: response.data?.pagination,
  };
};

/**
 * Получить список сообщений с выбранным собеседником
 * @param {Object} params
 * @param {number} params.partnerId - ID собеседника
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество элементов на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<{messages: MessagesListSchema, pagination}} {messages, pagination}
 */
export const fetchMessagesApi = async ({ partnerId, page, limit, signal }) => {
  const response = await api.get(`/messages/conversation/${partnerId}`, {
    params: {
      page,
      limit,
    },
    signal,
  });
  return {
    messages: MessagesListSchema.parse(response.data?.messages),
    pagination: response.data?.pagination,
  };
};

/**
 * Получить сообщение по ID (для кнопки "Поделиться")
 * @param {number} messageId - ID сообщения
 * @returns {Promise<{message: MessageSchema}} {message}
 */
export const fetchMessageById = async (messageId) => {
  const response = await api.get(`/messages/${messageId}/shared`);
  return MessageSchema.parse(response.data?.message);
};

/**
 * Отправить сообщение собеседнику
 * @param {number} receiverId - ID собеседника
 * @param {string} content - контент сообщения
 * @returns {Promise<{message: MessageSchema}} {message}
 */
export const sendMessageApi = async (receiverId, content) => {
  const response = await api.post(`/messages/send`, {
    receiverId,
    content,
  });
  return MessageSchema.parse(response.data?.message);
};

/**
 * Обновить сообщение
 * @param {number} messageId - ID сообщения
 * @param {string} content - новый контент сообщения
 * @returns {Promise<{message: MessageSchema}} {message}
 */
export const updateMessageApi = async (messageId, content) => {
  const response = await api.patch(`/messages/${messageId}/edit`, {
    content,
  });
  return MessageSchema.parse(response.data?.message);
};

/**
 * Отметка о прочтении
 * @param {number[]} messageIds - массив ID сообщений
 * @returns {Promise<Object>} { message }
 */
export const markMessagesAsRead = async (messageIds) => {
  const response = await api.patch(`/messages/read`, { messageIds });
  return response.data;
};

/**
 * Скрыть сообщение (удаляет сообщение только у текущего пользователя)
 * @param {number} messageId - ID сообщения
 * @returns {Promise<Object>} { message }
 */
export const hideMessageApi = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/hide`);
  return response.data;
};

/**
 * Очистить чат с пользователем (удаляет чат только у текущего пользователя)
 * @param {number} receiverId - ID собеседника
 * @returns {Promise<Object>} { message }
 */
export const clearChatApi = async (receiverId) => {
  const response = await api.patch(`/messages/clear/${receiverId}`);
  return response.data;
};
