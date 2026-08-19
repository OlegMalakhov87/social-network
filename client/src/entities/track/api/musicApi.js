import { api } from '../../../shared/api';
import { unwrapApiEntity } from '../../../shared/lib';

/**
 * Получить все публичные треки с возможностью фильтрации по жанру и поиску.
 * @param {Object} params - параметры
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {string} params.filter - фильтр по жанру
 * @param {string} [params.q] - поисковый запрос
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Promise<Object>} { tracks, pagination }
 */
export const fetchTracksApi = async ({
  page,
  filter,
  q,
  limit,
  signal,
  sortKey,
} = {}) => {
  const response = await api.get('/music', {
    params: {
      page,
      limit,
      genre: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
      sortKey,
    },
    signal,
  });
  return unwrapApiEntity(response.data, ['tracks']);
};

/**
 * Загрузить новый трек.
 * @param {Object} formData - поля трека
 * @returns {Promise<Object>} { track }
 */
export const addTrackApi = async (formData) => {
  const response = await api.post('/music/add', formData);
  return unwrapApiEntity(response.data, ['tracks']);
};

/**
 * Обновить трек.
 * @param {number} trackId - ID трека
 * @param {Object} updates - поля трека
 * @returns {Promise<Object>} { track }
 */
export const updateTrackApi = async (trackId, updates) => {
  const response = await api.put(`/music/${trackId}/update`, updates);
  return unwrapApiEntity(response.data, ['tracks']);
};

/**
 * Обновить приватность треков.
 * @param {boolean} isPublic - видимость треков
 * @returns {Promise<Object>} { isPublic }
 */
export const updateTracksPrivacyApi = async (isPublic) => {
  const response = await api.put(`/music/privacy`, { isPublic });
  return unwrapApiEntity(response.data, ['tracks']);
};

/**
 * Обновить счетчик прослушиваний трека.
 * @param {number} trackId - ID трека
 * @returns {Promise<Object>} { track }
 */
export const incrementTrackPlaysCount = async (trackId) => {
  const response = await api.put(`/music/${trackId}/plays`);
  return unwrapApiEntity(response.data, ['tracks']);
};

/**
 * Удалить трек.
 * @param {number} trackId - ID трека
 * @returns {Promise<Object>} { trackId }
 */
export const deleteTrackApi = async (trackId) => {
  const response = await api.delete(`/music/${trackId}/delete`);
  return unwrapApiEntity(response.data, ['tracks']);
};
