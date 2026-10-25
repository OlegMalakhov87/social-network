import { PostSchema, PostsListSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Возвращает посты пользователя.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {number} [params.userId] - Идентификатор пользователя
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {string} [params.sortKey] - Ключ сортировки
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @returns {Promise<{ posts: Object[], pagination: Object }>} Посты и пагинация
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
    posts: PostsListSchema.parse(response.data?.posts),
    pagination: response.data?.pagination,
  };
};

/**
 * Возвращает пост по идентификатору.
 *
 * @param {number} postId - Идентификатор поста
 * @returns {Promise<Object>} Пост
 */
export const fetchPostById = async (postId) => {
  const response = await api.get(`/posts/${postId}/shared`);
  return PostSchema.parse(response.data?.post);
};

/**
 * Добавляет пост.
 *
 * @param {Object} data - Поля поста
 * @returns {Promise<Object>} Пост
 */
export const addPostApi = async (data) => {
  const response = await api.post('/posts/add', data);
  return PostSchema.parse(response.data?.post);
};

/**
 * Загружает медиафайл поста.
 *
 * @param {FormData} formData - Медиафайл поста
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadPostMediaApi = async (formData, config) => {
  const response = await api.post('/posts/upload-media', formData, config);
  return response.data;
};

/**
 * Обновляет пост по идентификатору.
 *
 * @param {number} postId - Идентификатор поста
 * @param {Object} updates - Поля поста
 * @returns {Promise<Object>} Пост
 */
export const updatePostApi = async (postId, updates) => {
  const response = await api.put(`/posts/${postId}/update`, updates);
  return PostSchema.parse(response.data?.post);
};

/**
 * Обновляет приватность постов.
 *
 * @param {boolean} isPublic - Признак публичности постов
 * @returns {Promise<Object>} Ответ сервера
 */
export const updatePostsPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/posts/update-privacy`, { isPublic });
  return response.data;
};

/**
 * Удаляет пост по идентификатору.
 *
 * @param {number} postId - Идентификатор поста
 * @returns {Promise<Object>} Ответ сервера
 */
export const deletePostApi = async (postId) => {
  const response = await api.delete(`/posts/${postId}/delete`);
  return response.data;
};

/**
 * Удаляет загруженные медиафайлы поста.
 *
 * @param {Object} data - Данные поста
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedPostApi = async (data) => {
  const response = await api.delete('/posts/delete-uploaded-media', { data });
  return response.data;
};
