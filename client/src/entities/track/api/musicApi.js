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
      category: filter === 'all' ? undefined : filter,
      q: q?.trim() || undefined,
      sortKey,
    },
    signal,
  });
  return response.data;
};

/**
 * Загрузить новый трек.
 * @param {Object} formData - поля трека
 * @returns {Promise<Object>} { track }
 */
export const addTrackApi = async (formData) => {
  const response = await api.post('/music/add', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Загрузить медиа файл для трека.
 * @param {FormData} formData - формат данных медиа файла
 * @returns {Promise<{Object}>} { audioUrl }
 */
export const uploadTrackAudioApi = async (formData) => {
  const response = await api.post('/music/upload-audio', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Загрузить медиа файл для обложки трека.
 * @param {FormData} formData - формат данных медиа файла
 * @returns {Promise<{Object}>} { coverUrl }
 */
export const uploadTrackCoverApi = async (formData) => {
  const response = await api.post('/music/upload-cover', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить трек.
 * @param {number} trackId - ID трека
 * @param {Object} updates - поля трека
 * @returns {Promise<Object>} { track }
 */
export const updateTrackApi = async (trackId, updates) => {
  const response = await api.put(`/music/${trackId}/update`, updates);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить приватность треков.
 * @param {boolean} isPublic - видимость треков
 * @returns {Promise<Object>} { message, tracks }
 */
export const updateTracksPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/music/update-privacy`, { isPublic });
  return unwrapApiEntity(response.data);
};

/**
 * Обновить счетчик прослушиваний трека.
 * @param {number} trackId - ID трека
 * @returns {Promise<Object>} { success, playsCount }
 */
export const incrementTrackPlaysCount = async (trackId) => {
  const response = await api.patch(`/music/${trackId}/plays`);
  return unwrapApiEntity(response.data);
};

/**
 * Удалить трек.
 * @param {number} trackId - ID трека
 * @returns {Promise<Object>} { message, trackId }
 */
export const deleteTrackApi = async (trackId) => {
  const response = await api.delete(`/music/${trackId}/delete`);
  return unwrapApiEntity(response.data);
};

/**
 * Удалить загруженные медиа треков (очистка мусора).
 * @param {Object} data - данные трека
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedAudioApi = async (data) => {
  const response = await api.delete('/music/delete-uploaded-audio', { data });
  return unwrapApiEntity(response.data);
};

/**
 * Удалить загруженные медиа обложек.
 * @param {Object} data - данные обложки
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedCoverApi = async (data) => {
  const response = await api.delete('/music/delete-uploaded-cover', { data });
  return unwrapApiEntity(response.data);
};
