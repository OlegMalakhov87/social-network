import { apiAxios } from '../../../shared/api';

/**
 * Получить все публичные видео с возможностью фильтрации.
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=30]
 * @param {string} [params.category] – категория
 * @param {string} [params.q] – поисковый запрос
 * @returns {Promise<Object>} { videos, pagination }
 */
export async function fetchVideos({ page = 1, limit = 30, category, q } = {}) {
  const response = await apiAxios.get('/videos', {
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
 * Получить одно видео по ID (нереализовано, возможно в будущем)
 * @param {number} videoId
 * @returns {Promise<Object>}
 */
export async function fetchVideoById(videoId) {
  const response = await apiAxios.get(`/videos/${videoId}`);
  return response.data;
}

/**
 * Загрузить новое видео.
 * @param {Object} formData – поля видео (title, description, videoUrl, category, size, year, duration)
 * @returns {Promise<Object>}
 */
export async function createVideo(formData) {
  const response = await apiAxios.post('/videos', formData);
  return response.data;
}

/**
 * Обновить видео (счетчик просмотров на странице видео).
 * @param {number} videoId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function incrementViewCount(videoId) {
  const response = await apiAxios.put(`/videos/${videoId}`);
  return response.data;
}

/**
 * Удалить видео.
 * @param {number} videoId
 * @returns {Promise<Object>}
 */
export async function deleteVideo(videoId) {
  const response = await apiAxios.delete(`/videos/${videoId}`);
  return response.data;
}
