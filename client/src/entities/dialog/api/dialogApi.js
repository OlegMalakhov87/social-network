import { api } from '../../../shared/api';

/**
 * Получить список диалогов
 * @param {Object} params
 * @param {number} params.page - номер страницы
 * @param {string} [params.q] - поисковый запрос
 * @param {number} params.limit - количество элементов на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
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
 * Получить список сообщений с выбранным пользователем
 * @param {Object} params
 * @param {number} params.userId - ID собеседника
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество элементов на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
 */
export const fetchMessagesApi = async ({ userId, page, limit, signal }) => {
  const response = await api.get(`/messages/conversation/${userId}`, {
    params: {
      page,
      limit,
    },
    signal,
  });
  return response.data;
};

/**
 * Получить сообщение по ID
 * @param {number} messageId - ID сообщения
 * @returns {Promise<Object>} { message }
 */
export const fetchMessageById = async (messageId) => {
  const response = await api.get(`/messages/${messageId}/shared`);
  return response.data;
};

/**
 * Отправить сообщение
 * @param {number} userId - ID собеседника
 * @param {string} text - текст сообщения
 * @returns {Promise<Object>} { message }
 */
export const sendMessageApi = async (userId, text) => {
  const response = await api.post(`/messages/send`, {
    userId,
    text,
  });
  return response.data;
};

/**
 * Скрыть сообщение (удаляет сообщение только у текущего пользователя)
 * @param {number} messageId - ID сообщения
 * @returns {Promise<Object>} { success: boolean }
 */
export const hideMessageApi = async (messageId) => {
  const response = await api.delete(`/messages/${messageId}/hide`);
  return response.data;
};

/**
 * Обновить сообщение
 * @param {number} messageId - ID сообщения
 * @param {string} newText - новый текст сообщения
 * @returns {Promise<Object>} { success: boolean }
 */
export const updateMessageApi = async (messageId, newText) => {
  const response = await api.put(`/messages/${messageId}/edit`, {
    text: newText,
  });
  return response.data;
};

/**
 * Отметка о прочтении
 * @param {number[]} messageIds - массив ID сообщений
 * @returns {Promise<Object>} { success: boolean }
 */
export const markMessagesAsRead = async (messageIds) => {
  const response = await api.put(`/messages/read`, { messageIds });
  return response.data;
};

/**
 * Очистить чат с пользователем (удаляет чат только у текущего пользователя)
 * @param {number} userId - ID собеседника
 * @returns {Promise<Object>} { success: boolean }
 */
export const clearChatApi = async (userId) => {
  const response = await api.put(`/messages/clear/${userId}`);
  return response.data;
};
