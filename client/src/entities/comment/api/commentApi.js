import { apiFetch } from '../../../shared/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Получить комментарии для конкретной сущности.
 * @param {string} targetType – 'Post' | 'Music' | 'Video' | 'News'
 * @param {number} targetId
 * @returns {Promise<Object>} { comments, pagination }
 */
export async function fetchComments(targetType, targetId) {
  const response = await apiFetch(`${BASE_URL}/comments/${targetType}/${targetId}`);
  if (!response.ok) {
    throw new Error(`Ошибка загрузки комментариев: ${response.status}`);
  }
  return response.json();
}

/**
 * Добавить комментарии для конкретной сущности.
 * @param {string} targetType – 'Post' | 'Music' | 'Video' | 'News'
 * @param {number} targetId
 * @param {string} content
 * @returns {Promise<Object>} { comment}
 */
export async function addCommentApi(targetType, targetId, content) {
  const response = await apiFetch(`${BASE_URL}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ targetType, targetId, content }),
  });
  if (!response.ok) {
    throw new Error(`Ошибка добавления комментария: ${response.status}`);
  }
  return response.json();
}

/**
 * Изменить комментарий по ID.
 * @param {number} commentId
 * @param {string} newContent
 * @param {string} targetType
 * @param {number} targetId
 * @returns {Promise<Object>}
 */
export async function editCommentApi(commentId, newContent, targetType, targetId) {
  const response = await apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content: newContent, targetType, targetId }),
  });
  if (!response.ok) {
    throw new Error(`Ошибка изменения комментария: ${response.status}`);
  }
  return response.json();
}

/**
 * Удалить комментарии по ID
 * @param {number} commentId
 * @returns {Promise<number} {commentId}
 */
export async function deleteCommentApi(commentId) {
  const response = await apiFetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Ошибка удаления комментария: ${response.status}`);
  }
  return response.json();
}
