import { apiFetch } from '../../../shared/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Получить посты пользователя.
 * @param {number} userId
 * @param {Object} [filters]
 * @returns {Promise<Object>} { posts, pagination }
 */
export async function fetchUserPosts(userId, { page = 1, limit = 30, visibility } = {}) {
  const url = new URL(`${BASE_URL}/posts/${userId}`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  if (visibility) url.searchParams.set('visibility', String(visibility));

  const response = await apiFetch(url.toString());
  if (!response.ok) {
    throw new Error(`Ошибка загрузки постов: ${response.status}`);
  }
  return response.json();
}

/**
 * Добавить пост.
 * @param {string} message
 * @param {string} visibility
 * @param {string} postType
 * @param {string} mediaUrl
 * @returns {Promise<Object>} { post }
 */
export async function addPostApi({ message, visibility, postType, mediaUrl }) {
  const response = await apiFetch(`${BASE_URL}/posts`, {
    method: 'POST',
    body: JSON.stringify({ message, visibility, postType, mediaUrl }),
  });
  if (!response.ok) {
    throw new Error(`Ошибка добавления поста: ${response.status}`);
  }
  return response.json();
}

/**
 * Обновить пост.
 * @param {string} message
 * @param {string} visibility
 * @param {string} postType
 * @param {string} mediaUrl
 * @returns {Promise<Object>} { post }
 */
export async function editPostApi(postId, message, visibility, postType, mediaUrl) {
  const response = await apiFetch(`${BASE_URL}/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify({ message, visibility, postType, mediaUrl }),
  });
  if (!response.ok) {
    throw new Error(`Ошибка обновления поста: ${response.status}`);
  }
  return response.json();
}

/**
 * Удалить пост по ID.
 * @param {number} postId
 * @returns {Promise<number>} { postId }
 */
export async function deletePostApi(postId) {
  const response = await apiFetch(`${BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Ошибка удаления поста: ${response.status}`);
  }
  return response.json();
}

/**
 * Получить пост по ID (для кнопки поделиться).
 * @param {number} postId
 * @returns {Promise<number>} { postId }
 */
export async function fetchPostById(postId) {
  const response = await apiFetch(`${BASE_URL}/posts/${postId}/shared`);
  if (!response.ok) {
    throw new Error(`Ошибка получения поста: ${response.status}`);
  }
  return response.json();
}
