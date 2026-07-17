import { api } from '../../../shared/api';

/**
 * Получить все новости с возможностью фильтрации по категории и поиску.
 * @param {Object} params - параметры запроса
 * @param {number} [params.page] - номер страницы
 * @param {number} [params.limit] - количество на странице
 * @param {string} [params.filter] - фильтр по категории
 * @param {string} [params.q] - поисковый запрос
 * @param {AbortSignal} [params.signal] - сигнал отмены запроса
 * @returns {Promise<Object>} - { items, pagination }
 */

export async function fetchNewsApi({ page, filter, q, limit, signal } = {}) {
  const response = await api.get(`/news`, {
    params: {
      page,
      limit,
      category: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
    },
    signal,
  });
  return {
    items: response.data.news || [],
    pagination: response.data.pagination || {},
  };
}

/**
 * Поделиться новостью.
 * @param {number} newsId
 * @returns {Promise<Object>} { news }
 */
export async function fetchNewsById(newsId) {
  const response = await api.get(`/news/${newsId}/shared`);
  return response.data;
}

/**
 * Добавить новость.
 * @param {Object} data - поля новости (title, content, category, author, source, mediaUrl)
 * @returns {Promise<Object>} { news }
 */
export async function addNewsApi(data) {
  const response = await api.post('/news', data);
  return response.data;
}

/**
 * Обновить новость.
 * @param {number} newsId - ID новости
 * @param {Object} updates - поля новости (title, content, category, author, source, mediaUrl)
 * @returns {Promise<Object>} { news }
 */
export async function updateNewsApi(newsId, updates) {
  const response = await api.put(`/news/${newsId}`, updates);
  return response.data;
}

/**
 * Обновить счетчик просмотров.
 * @param {number} newsId - ID новости
 * @returns {Promise<Object>} { news }
 */
export async function updateNewsViewCount(newsId) {
  const response = await api.put(`/news/${newsId}/view`);
  return response.data;
}

/**
 * Удалить новость.
 * @param {number} newsId - ID новости
 * @returns {Promise<Object>} newsId
 */
export async function deleteNewsApi(newsId) {
  const response = await api.delete(`/news/${newsId}`);
  return response.data;
}
