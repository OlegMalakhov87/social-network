import { apiFetch } from '../../../shared/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Получить комментарии для конкретной сущности.
 * @param {string} targetType – 'Post' | 'Music' | 'Video' | 'News'
 * @param {number} targetId
 * @param {number} [page=1] - номер страницы
 * @returns {Promise<Object>} { comments, pagination }
 */
export async function fetchComments(targetType, targetId, page = 1) {
  const response = await apiFetch(
    `${BASE_URL}/comments/${targetType}/${targetId}?page=${page}`
  );
  return response.json();
}

/**
 * Добавить комментарий.
 * @param {string} targetType
 * @param {number} targetId
 * @param {string} content
 * @returns {Promise<Object>} { comment }
 */
export async function addCommentApi(targetType, targetId, content) {
  const response = await apiFetch(`${BASE_URL}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, content }),
  });
  return response.json();
}

/**
 * Изменить комментарий по ID.
 * @param {number} commentId
 * @param {string} newContent
 * @param {string} targetType
 * @param {number} targetId
 * @returns {Promise<Object>} { comment }
 */
export async function editCommentApi(
  commentId,
  newContent,
  targetType,
  targetId
) {
  const response = await apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content: newContent, targetType, targetId }),
  });
  return response.json();
}

/**
 * Удалить комментарий по ID
 * @param {number} commentId
 * @returns {Promise<number>}{ commentId }
 */
export async function deleteCommentApi(commentId) {
  const response = await apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Получить комментарий по ID (для кнопки поделиться).
 * @param {number} commentId
 * @returns {Promise<Object>} { comment }
 */
export async function fetchCommentById(commentId) {
  const response = await apiFetch(`${BASE_URL}/comments/${commentId}/shared`);
  return response.json();
}