import { api } from '../../../shared/api';
import { unwrapApiEntity } from '../../../shared/lib';

/**
 * Получить посты пользователя.
 * @param {Object} params - параметры
 * @param {number} params.userId - ID пользователя
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.sortKey - ключ сортировки
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { posts, pagination }
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
  return response.data;
};

/**
 * Получить пост по ID (для кнопки поделиться).
 * @param {number} postId - ID поста
 * @returns {Promise<Object>} { post }
 */
export const fetchPostById = async (postId) => {
  const response = await api.get(`/posts/${postId}/shared`);
  return unwrapApiEntity(response.data);
};

/**
 * Добавить пост.
 * @param {Object} data - поля поста
 * @returns {Promise<Object>} { post }
 */
export const addPostApi = async (data) => {
  const response = await api.post('/posts/add', data);
  return unwrapApiEntity(response.data);
};

/**
 * Загрузить медиа файл для поста.
 * @param {FormData} formData - формат данных медиа файла
 * @returns {Promise<{Object}>} { postUrl }
 */
export const uploadPostMediaApi = async (formData) => {
  const response = await api.post('/posts/upload-media', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить пост по ID.
 * @param {number} postId - ID поста
 * @param {Object} updates - поля поста
 * @returns {Promise<Object>} { post }
 */
export const updatePostApi = async (postId, updates) => {
  const response = await api.put(`/posts/${postId}/update`, updates);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить приватность постов.
 * @param {boolean} isPublic - видимость постов
 * @returns {Promise<Object>} { message, posts }
 */
export const updatePostsPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/posts/update-privacy`, { isPublic });
  return unwrapApiEntity(response.data);
};

/**
 * Удалить пост по ID.
 * @param {number} postId - ID поста
 * @returns {Promise<Object>} { message, postId }
 */
export const deletePostApi = async (postId) => {
  const response = await api.delete(`/posts/${postId}/delete`);
  return unwrapApiEntity(response.data);
};

/**
 * Удалить (очистка мусора) загруженные медиа файлы.
 * @param {Object} data - данные поста
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedPostApi = async (data) => {
  const response = await api.delete('/posts/delete-uploaded-media', { data });
  return unwrapApiEntity(response.data);
};
