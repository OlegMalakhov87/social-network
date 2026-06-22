import { apiAxios } from '../../../shared/api';

/**
 * Получить все новости с возможностью фильтрации по категории и поиску.
 * @param {Object} params - параметры запроса
 * @param {number} [params.page=1]
 * @param {number} [params.limit=30]
 * @param {string} [params.category] - категория для фильтрации
 * @param {string} [params.q] - поисковый запрос
 * @returns {Promise<Object>} - { news, pagination }
 */

export async function fetchNews({ page = 1, limit = 30, category, q } = {}) {
  const response = await apiAxios.get('/news', {
    params: {
      page,
      limit,
      category: category === 'All' ? undefined : category,
      q: q?.trim() || undefined,
    },
  });
  return response.data;
}

/**
 * Получить одну новость по ID.
 * @param {number} id
 * @returns {Promise<Object>} новость
 */
export async function fetchNewsById(id) {
  const response = await apiAxios.get(`/news/${id}`);
  return response.data;
}

/**
 * Создать новость.
 * @param {Object} data - поля новости (title, content, category, author, source, imageUrl)
 * @returns {Promise<Object>} созданная новость
 */
export async function createNews(data) {
  const response = await apiAxios.post('/news', data);
  return response.data;
}

/**
 * Увеличить счетчик просмотров.
 * @param {number} newsId - ID новости
 * @returns {Promise<Object>} обновлённая новость
 */
export async function incrementNewsView(newsId) {
  const response = await apiAxios.put(`/news/${newsId}/view`);
  return response.data;
}

/**
 * Обновить новость.
 * @param {number} id
 * @param {Object} updates
 * @returns {Promise<Object>} обновлённая новость
 */
export async function updateNews(id, updates) {
  const response = await apiAxios.put(`/news/${id}`, updates);
  return response.data;
}

/**
 * Удалить новость.
 * @param {number} id
 * @returns {Promise<Object>} подтверждение
 */
export async function deleteNews(id) {
  const response = await apiAxios.delete(`/news/${id}`);
  return response.data;
}
