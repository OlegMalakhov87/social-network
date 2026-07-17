import { api } from '../../../shared/api';

/**
 * Получить все публичные видео с возможностью фильтрации по категории и поиску.
 * @param {Object} params
 * @param {number} [params.page]
 * @param {number} [params.limit]
 * @param {string} [params.filter] – фильтр по категории
 * @param {string} [params.q] – поисковый запрос
 * @param {AbortSignal} [params.signal] - сигнал отмены запроса
 * @returns {Promise<Object>} { videos, pagination }
 */
export async function fetchVideosApi({ page, limit, filter, q, signal } = {}) {
  const response = await api.get('/videos', {
    params: {
      page,
      limit,
      category: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
    },
    signal,
  });
    return {
      items: response.data.videos || [],
      pagination: response.data.pagination || {},
    };
}

/**
 * Загрузить новое видео.
 * @param {Object} formData – поля видео (title, description, videoUrl, category, size, year, duration)
 * @returns {Promise<Object>}
 */
export async function addVideoApi(formData) {
  const response = await api.post('/videos', formData);
  return response.data;
}

/**
 * Обновить видео.
 * @param {number} videoId - ID видео
 * @param {Object} updates - поля видео
 * @returns {Promise<Object>} { video }
 */
export async function updateVideoApi(videoId, updates) {
  const response = await api.put(`/videos/${videoId}`, updates);
  return response.data;
}
/**
 * Обновить счетчик просмотров видео.
 * @param {number} videoId - ID видео
 * @returns {Promise<Object>} { video }
 */
export async function incrementVideoViewCount(videoId) {
  const response = await api.put(`/videos/${videoId}/view`);
  return response.data;
}

/**
 * Удалить видео.
 * @param {number} videoId - ID видео
 * @returns {Promise<Object>} { videoId }
 */
export async function deleteVideoApi(videoId) {
  const response = await api.delete(`/videos/${videoId}`);
  return response.data;
}
