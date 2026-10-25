import { DialogsListSchema, MessageSchema, MessagesListSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Возвращает список диалогов.
 *
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {string} [params.q] - Поисковый запрос
 * @param {number} params.limit - Количество элементов на странице
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @returns {Promise<{ dialogs: Object[], pagination: Object }>} Диалоги и пагинация
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
 * Возвращает сообщения выбранного собеседника.
 *
 * @param {Object} params - Параметры запроса
 * @param {number} params.partnerId - Идентификатор собеседника
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество элементов на странице
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @returns {Promise<{ messages: Object[], pagination: Object }>} Сообщения и пагинация
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
 * Возвращает сообщение по идентификатору.
 *
 * @param {number} messageId - Идентификатор сообщения
 * @returns {Promise<Object>} Сообщение
 */
export const fetchMessageById = async (messageId) => {
  const response = await api.get(`/messages/${messageId}/shared`);
  return MessageSchema.parse(response.data?.message);
};

/**
 * Отправляет сообщение собеседнику.
 *
 * @param {number} receiverId - Идентификатор собеседника
 * @param {string} content - Текст сообщения
 * @returns {Promise<Object>} Сообщение
 */
export const sendMessageApi = async (receiverId, content) => {
  const response = await api.post(`/messages/send`, {
    receiverId,
    content,
  });
  return MessageSchema.parse(response.data?.message);
};

/**
 * Обновляет сообщение.
 *
 * @param {number} messageId - Идентификатор сообщения
 * @param {string} content - Новый текст сообщения
 * @returns {Promise<Object>} Сообщение
 */
export const updateMessageApi = async (messageId, content) => {
  const response = await api.patch(`/messages/${messageId}/edit`, {
    content,
  });
  return MessageSchema.parse(response.data?.message);
};

/**
 * Отмечает сообщения прочитанными.
 *
 * @param {number[]} messageIds - Идентификаторы сообщений
 * @returns {Promise<Object>} Ответ сервера
 */
export const markMessagesAsRead = async (messageIds) => {
  const response = await api.patch(`/messages/read`, { messageIds });
  return response.data;
};

/**
 * Скрывает сообщение у текущего пользователя.
 *
 * @param {number} messageId - Идентификатор сообщения
 * @returns {Promise<Object>} Ответ сервера
 */
export const hideMessageApi = async (messageId) => {
  const response = await api.patch(`/messages/${messageId}/hide`);
  return response.data;
};

/**
 * Очищает чат у текущего пользователя.
 *
 * @param {number} receiverId - Идентификатор собеседника
 * @returns {Promise<Object>} Ответ сервера
 */
export const clearChatApi = async (receiverId) => {
  const response = await api.patch(`/messages/clear/${receiverId}`);
  return response.data;
};
