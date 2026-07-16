import { api } from '../../../shared/api';

/**
 * Получить посты пользователя.
 * @param {Object} params - параметры запроса
 * @param {number} [params.userId] - ID пользователя
 * @param {number} [params.page] - номер страницы
 * @param {number} [params.limit] - количество на странице
 * @param {AbortSignal} [params.signal] - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
 */
export async function fetchPostsApi({ userId, page, limit, signal } = {}) {
  const response = await api.get(`/posts/${userId}`, {
    params: {
      page,
      limit,
    },
    signal,
  });
  return {
    items: response.data.posts || [],
    pagination: response.data.pagination || {},
  };
}

/**
 * Получить пост по ID (для кнопки поделиться).
 * @param {number} postId
 * @returns {Promise<Object>} { post }
 */
export async function fetchPostById(postId) {
  const response = await api.get(`/posts/${postId}/shared`);
  return response.data;
}

/**
 * Добавить пост.
 * @param {Object} data - поля поста (message, visibility, type, mediaUrl)
 * @returns {Promise<Object>} { post }
 */
export async function addPostApi(data) {
  const response = await api.post('/posts', data);
  return response.data;
}

/**
 * Обновить пост по ID.
 * @param {number} postId - ID поста
 * @param {Object} updates - поля поста (message, visibility, type, mediaUrl)
 * @returns {Promise<Object>} { post }
 */
export async function updatePostApi(postId, updates) {
  const response = await api.put(`/posts/${postId}`, updates);
  return response.data;
}

/**
 * Удалить пост по ID.
 * @param {number} postId - ID поста
 * @returns {Promise<Object>} { postId }
 */
export async function deletePostApi(postId) {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
}
