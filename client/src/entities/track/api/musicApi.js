import { api } from '../../../shared/api';

/**
 * Получить все публичные треки с возможностью фильтрации по жанру и поиску.
 * @param {Object} params - параметры
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.filter - фильтр по жанру
 * @param {string} [params.q] - поисковый запрос
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { tracks, pagination }
 */
export const fetchTracksApi = async ({
  page,
  filter,
  q,
  limit,
  signal,
} = {}) => {
  const response = await api.get('/music', {
    params: {
      page,
      limit,
      genre: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
    },
    signal,
  });
  return response.data;
};

/**
 * Загрузить новый трек.
 * @param {Object} formData - поля трека (title, artist, fileUrl, genre, album, year, duration, description, isPublic)
 * @returns {Promise<Object>} { track }
 */
export const addTrackApi = async (formData) => {
  const response = await api.post('/music', formData);
  return response.data;
};

/**
 * Обновить трек.
 * @param {number} trackId - ID трека
 * @param {Object} updates - поля трека
 * @returns {Promise<Object>} { track }
 */
export const updateTrackApi = async (trackId, updates) => {
  const response = await api.put(`/music/${trackId}`, updates);
  return response.data;
};

/**
 * Обновить счетчик прослушиваний трека.
 * @param {number} trackId - ID трека
 * @returns {Promise<Object>} { track }
 */
export const incrementTrackPlayCount = async (trackId) => {
  const response = await api.put(`/music/${trackId}/play`);
  return response.data;
};

/**
 * Удалить трек.
 * @param {number} trackId - ID трека
 * @returns {Promise<Object>} { trackId }
 */
export const deleteTrackApi = async (trackId) => {
  const response = await api.delete(`/music/${trackId}`);
  return response.data;
};
