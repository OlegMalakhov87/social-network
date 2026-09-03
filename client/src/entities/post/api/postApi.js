import { api } from '../../../shared/api';

/**
 * Получить посты пользователя.
 * @param {Object} params - параметры
 * @param {number} params.userId - ID пользователя
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.sortKey - ключ сортировки
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
 */
export const fetchPostsApi = async ({
  userId,
  page,
  limit,
  sortKey,
  signal,
} = {}) => {
  const response = await api.get(`/posts/${userId}`, {
    params: {
      page,
      limit,
      sortKey,
    },
    signal,
  });
  return {
    items: response.data.posts || [],
    pagination: response.data.pagination || {},
  };
};

/**
 * Получить пост по ID (для кнопки поделиться).
 * @param {number} postId - ID поста
 * @returns {Promise<Object>} { post }
 */
export const fetchPostById = async (postId) => {
  const response = await api.get(`/posts/${postId}/shared`);
  return response.data;
};

/**
 * Добавить пост.
 * @param {Object} data - поля поста
 * @returns {Promise<Object>} { post }
 */
export const addPostApi = async (data) => {
  const response = await api.post('/posts/add', data);
  return response.data;
};

/**
 * Обновить пост по ID.
 * @param {number} postId - ID поста
 * @param {Object} updates - поля поста
 * @returns {Promise<Object>} { post }
 */
export const updatePostApi = async (postId, updates) => {
  const response = await api.put(`/posts/${postId}/update`, updates);
  return response.data;
};

/**
 * Обновить приватность постов.
 * @param {boolean} isPublic - видимость постов
 * @returns {Promise<Object>} { isPublic }
 */
export const updatePostsPrivacyApi = async (isPublic) => {
  const response = await api.put(`/posts/update-privacy`, { isPublic });
  return response.data;
};

/**
 * Удалить пост по ID.
 * @param {number} postId - ID поста
 * @returns {Promise<Object>} { postId }
 */
export const deletePostApi = async (postId) => {
  const response = await api.delete(`/posts/${postId}/delete`);
  return response.data;
};

/**
 * Удалить загруженные медиа постов.
 * @param {Object} data - данные поста
 * @returns {Promise<Object>} { postId }
 */
export const deleteUploadedPostApi = async (data) => {
  const response = await api.delete('/posts/delete-uploaded-media', { data });
  return response.data;
};
