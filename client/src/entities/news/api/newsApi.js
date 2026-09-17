import { api } from '../../../shared/api';
import { unwrapApiEntity } from '../../../shared/lib';

/**
 * Получить все новости с возможностью фильтрации по категории и поиску.
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.sortKey - ключ сортировки
 * @param {string} params.filter - фильтр по категории
 * @param {string} [params.q] - поисковый запрос
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} - { news, pagination }
 */

export const fetchNewsApi = async ({
  page,
  limit,
  sortKey,
  filter,
  q,
  signal,
}) => {
  const response = await api.get(`/news`, {
    params: {
      page,
      limit,
      sortKey,
      category: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
    },
    signal,
  });
  return response.data;
};

/**
 * Поделиться новостью (для кнопки поделиться).
 * @param {number} newsId
 * @returns {Promise<Object>} { news }
 */
export const fetchNewsById = async (newsId) => {
  const response = await api.get(`/news/${newsId}/shared`);
  return unwrapApiEntity(response.data);
};

/**
 * Добавить новость.
 * @param {Object} data - поля новости
 * @returns {Promise<Object>} { news }
 */
export const addNewsApi = async (formData) => {
  const response = await api.post('/news/add', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Загрузить медиа файл для новости.
 * @param {FormData} formData - формат данных медиа файла
 * @returns {Promise<{Object}>} { newsUrl }
 */
export const uploadNewsMediaApi = async (formData) => {
  const response = await api.post('/news/upload-media', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить новость.
 * @param {number} newsId - ID новости
 * @param {Object} updates - поля новости
 * @returns {Promise<Object>} {news }
 */
export const updateNewsApi = async (newsId, updates) => {
  const response = await api.put(`/news/${newsId}/update`, updates);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить счетчик просмотров новости.
 * @param {number} newsId - ID новости
 * @returns {Promise<Object>}  { success, viewsCount }
 */
export const updateNewsViewsCountApi = async (newsId) => {
  const response = await api.patch(`/news/${newsId}/views`);
  return unwrapApiEntity(response.data);
};

/**
 * Удалить новость по ID.
 * @param {number} newsId - ID новости
 * @returns {Promise<Object>} { message, newsId }
 */
export const deleteNewsApi = async (newsId) => {
  const response = await api.delete(`/news/${newsId}/delete`);
  return unwrapApiEntity(response.data);
};

/**
 * Удалить (очистка мусора) загруженные медиа файлы.
 * @param {Object} data - данные новости
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedNewsApi = async (data) => {
  const response = await api.delete('/news/delete-uploaded-media', { data });
  return unwrapApiEntity(response.data);
};
