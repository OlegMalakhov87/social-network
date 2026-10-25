import { NewsListSchema, NewsSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Возвращает новости с фильтром и поиском.
 *
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество на странице
 * @param {string} params.sortKey - Ключ сортировки
 * @param {string} params.filter - Фильтр категории
 * @param {string} [params.q] - Поисковый запрос
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @returns {Promise<{ news: Object[], pagination: Object }>} Новости и пагинация
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
  return {
    news: NewsListSchema.parse(response.data?.news),
    pagination: response.data?.pagination,
  };
};

/**
 * Возвращает новость по идентификатору.
 *
 * @param {number} newsId - Идентификатор новости
 * @returns {Promise<Object>} Новость
 */
export const fetchNewsById = async (newsId) => {
  const response = await api.get(`/news/${newsId}/shared`);
  return NewsSchema.parse(response.data?.news);
};

/**
 * Добавляет новость.
 *
 * @param {Object} formData - Поля новости
 * @returns {Promise<Object>} Новость
 */
export const addNewsApi = async (formData) => {
  const response = await api.post('/news/add', formData);
  return NewsSchema.parse(response.data?.news);
};

/**
 * Загружает медиафайл новости.
 *
 * @param {FormData} formData - Медиафайл новости
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadNewsMediaApi = async (formData, config) => {
  const response = await api.post('/news/upload-media', formData, config);
  return response.data;
};

/**
 * Обновляет новость.
 *
 * @param {number} newsId - Идентификатор новости
 * @param {Object} updates - Поля новости
 * @returns {Promise<Object>} Новость
 */
export const updateNewsApi = async (newsId, updates) => {
  const response = await api.put(`/news/${newsId}/update`, updates);
  return NewsSchema.parse(response.data?.news);
};

/**
 * Обновляет счётчик просмотров новости.
 *
 * @param {number} newsId - Идентификатор новости
 * @returns {Promise<Object>} Ответ сервера
 */
export const updateNewsViewsCountApi = async (newsId) => {
  const response = await api.patch(`/news/${newsId}/views`);
  return response.data;
};

/**
 * Удаляет новость по идентификатору.
 *
 * @param {number} newsId - Идентификатор новости
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteNewsApi = async (newsId) => {
  const response = await api.delete(`/news/${newsId}/delete`);
  return response.data;
};

/**
 * Удаляет загруженные медиафайлы новости.
 *
 * @param {Object} data - Данные новости
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedNewsApi = async (data) => {
  const response = await api.delete('/news/delete-uploaded-media', { data });
  return response.data;
};
