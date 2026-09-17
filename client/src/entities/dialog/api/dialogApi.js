import { api } from '../../../shared/api';
import { unwrapApiEntity } from '../../../shared/lib';

/**
 * Получить список диалогов
 * @param {Object} params
 * @param {number} params.page - номер страницы
 * @param {string} [params.q] - поисковый запрос
 * @param {number} params.limit - количество элементов на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { dialogs, pagination }
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
  return response.data;
};

/**
 * Получить список сообщений с выбранным собеседником
 * @param {Object} params
 * @param {number} params.partnerId - ID собеседника
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество элементов на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { messages, pagination }
 */
export const fetchMessagesApi = async ({ partnerId, page, limit, signal }) => {
  const response = await api.get(`/messages/conversation/${partnerId}`, {
    params: {
      page,
      limit,
    },
    signal,
  });
  return response.data;
};

/**
 * Получить сообщение по ID (для кнопки "Поделиться")
 * @param {number} messageId - ID сообщения
 * @returns {Promise<Object>} { message }
 */
export const fetchMessageById = async (messageId) => {
  const response = await api.get(`/messages/${messageId}/shared`);
  return unwrapApiEntity(response.data);
};

/**
 * Отправить сообщение собеседнику
 * @param {number} receiverId - ID собеседника
 * @param {string} content - контент сообщения
 * @returns {Promise<Object>} { message }
 */
export const sendMessageApi = async (receiverId, content) => {
  const response = await api.post(`/messages/send`, {
    receiverId,
    content,
  });
  return unwrapApiEntity(response.data);
};

/**
 * Обновить сообщение
 * @param {number} messageId - ID сообщения
 * @param {string} content - новый контент сообщения
 * @returns {Promise<Object>} { message }
 */
export const updateMessageApi = async (messageId, content) => {
  const response = await api.patch(`/messages/${messageId}/edit`, {
    content,
  });
  return unwrapApiEntity(response.data);
};

/**
 * Отметка о прочтении
 * @param {number[]} messageIds - массив ID сообщений
 * @returns {Promise<Object>} { message }
 */
export const markMessagesAsRead = async (messageIds) => {
  const response = await api.patch(`/messages/read`, { messageIds });
  return unwrapApiEntity(response.data);
};

/**
 * Скрыть сообщение (удаляет сообщение только у текущего пользователя)
 * @param {number} messageId - ID сообщения
 * @returns {Promise<Object>} { message }
 */
export const hideMessageApi = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/hide`);
  return unwrapApiEntity(response.data);
};

/**
 * Очистить чат с пользователем (удаляет чат только у текущего пользователя)
 * @param {number} receiverId - ID собеседника
 * @returns {Promise<Object>} { message }
 */
export const clearChatApi = async (receiverId) => {
  const response = await api.patch(`/messages/clear/${receiverId}`);
  return unwrapApiEntity(response.data);
};
