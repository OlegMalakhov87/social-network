import { api } from '../../../shared/api';

/**
 * Получить комментарии для конкретной сущности.
 * @param {Object} params - параметры запроса
 * @param {string} params.targetType – 'Post' | 'Music' | 'Video' | 'News'
 * @param {number} params.targetId - ID сущности
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.sortKey - ключ сортировки
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { comments, pagination }
 */
export const fetchCommentsApi = async ({
  targetType,
  targetId,
  page,
  limit,
  sortKey,
  signal,
}) => {
  const response = await api.get(`/comments/${targetType}/${targetId}`, {
    params: { page, limit, sortKey },
    signal,
  });
  return response.data;
};

/**
 * Получить комментарий по ID (для кнопки поделиться).
 * @param {number} commentId - ID комментария
 * @returns {Promise<Object>} { comment }
 */
export const fetchCommentById = async (commentId) => {
  const response = await api.get(`/comments/${commentId}/shared`);
  return response.data;
};

/**
 * Добавить комментарий.
 * @param {Object} data - поля комментария (targetType, targetId, content)
 * @returns {Promise<Object>} { comment }
 */
export const addCommentApi = async (data) => {
  const response = await api.post(`/comments/`, data);
  return response.data;
};

/**
 * Изменить комментарий по ID.
 * @param {number} commentId - ID комментария
 * @param {Object}  updates - поля комментария (content, targetType, targetId)
 * @returns {Promise<Object>} { comment }
 */
export const editCommentApi = async (commentId, updates) => {
  const response = await api.put(`/comments/${commentId}`, updates);
  return response.data;
};

/**
 * Удалить комментарий по ID
 * @param {number} commentId - ID комментария
 * @returns {Promise<Object>} { commentId }
 */
export const deleteCommentApi = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};
