import { api } from '../../../shared/api';

/**
 * Получить комментарии для конкретной сущности.
 * @param {string} targetType – 'Post' | 'Music' | 'Video' | 'News'
 * @param {number} targetId
 * @param {number} [page=1] - номер страницы
 * @returns {Promise<Object>} { comments, pagination }
 */
export async function fetchComments({
  targetType,
  targetId,
  page,
  limit,
  signal,
} = {}) {
  const response = await api.get(`/comments/${targetType}/${targetId}`, {
    params: { page, limit },
    signal,
  });
  return {
    items: response.data.comments || [],
    pagination: response.data.pagination || {},
  };
}

/**
 * Получить комментарий по ID (для кнопки поделиться).
 * @param {number} commentId - ID комментария
 * @returns {Promise<Object>} { comment }
 */
export async function fetchCommentById(commentId) {
  const response = await api.get(`/comments/${commentId}/shared`);
  return response.data;
}

/**
 * Добавить комментарий.
 * @param {Object} data - поля комментария (targetType, targetId, content)
 * @returns {Promise<Object>} { comment }
 */
export async function addCommentApi(data) {
  const response = await api.post(`/comments/`, data);
  return response.data;
}

/**
 * Изменить комментарий по ID.
 * @param {number} commentId - ID комментария
 * @param {Object}  updates - поля комментария (content, targetType, targetId)
 * @returns {Promise<Object>} { comment }
 */
export async function editCommentApi(commentId, updates) {
  const response = await api.put(`/comments/${commentId}`, updates);
  return response.data;
}

/**
 * Удалить комментарий по ID
 * @param {number} commentId - ID комментария
 * @returns {Promise<Object>} { commentId }
 */
export async function deleteCommentApi(commentId) {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
}


