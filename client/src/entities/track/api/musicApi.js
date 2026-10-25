import { TrackSchema, TracksListSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Возвращает публичные треки с фильтром и поиском.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {string} [params.filter] - Фильтр жанра
 * @param {string} [params.q] - Поисковый запрос
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @param {string} [params.sortKey] - Ключ сортировки
 * @returns {Promise<{ tracks: Object[], pagination: Object }>} Треки и пагинация
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
  return {
    tracks: TracksListSchema.parse(response.data?.tracks),
    pagination: response.data?.pagination,
  };
};

/**
 * Загружает новый трек.
 *
 * @param {Object} formData - Поля трека
 * @returns {Promise<Object>} Трек
 */
export const addTrackApi = async (formData) => {
  const response = await api.post('/music/add', formData);
  return TrackSchema.parse(response.data?.track);
};

/**
 * Загружает аудиофайл трека.
 *
 * @param {FormData} formData - Аудиофайл трека
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadTrackAudioApi = async (formData, config) => {
  const response = await api.post('/music/upload-audio', formData, config);
  return response.data;
};

/**
 * Загружает обложку трека.
 *
 * @param {FormData} formData - Файл обложки
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadTrackCoverApi = async (formData, config) => {
  const response = await api.post('/music/upload-cover', formData, config);
  return response.data;
};

/**
 * Обновляет трек.
 *
 * @param {number} trackId - Идентификатор трека
 * @param {Object} updates - Поля трека
 * @returns {Promise<Object>} Трек
 */
export const updateTrackApi = async (trackId, updates) => {
  const response = await api.put(`/music/${trackId}/update`, updates);
  return TrackSchema.parse(response.data?.track);
};

/**
 * Обновляет приватность треков.
 *
 * @param {boolean} isPublic - Признак публичности треков
 * @returns {Promise<Object>} Ответ сервера
 */
export const updateTracksPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/music/update-privacy`, { isPublic });
  return response.data;
};

/**
 * Обновляет счётчик прослушиваний трека.
 *
 * @param {number} trackId - Идентификатор трека
 * @returns {Promise<Object>} Ответ сервера
 */
export const incrementTrackPlaysCount = async (trackId) => {
  const response = await api.patch(`/music/${trackId}/plays`);
  return response.data;
};

/**
 * Удаляет трек.
 *
 * @param {number} trackId - Идентификатор трека
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteTrackApi = async (trackId) => {
  const response = await api.delete(`/music/${trackId}/delete`);
  return response.data;
};

/**
 * Удаляет загруженные аудиофайлы треков.
 *
 * @param {Object} data - Данные трека
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedAudioApi = async (data) => {
  const response = await api.delete('/music/delete-uploaded-audio', { data });
  return response.data;
};

/**
 * Удаляет загруженные обложки треков.
 *
 * @param {Object} data - Данные обложки
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedCoverApi = async (data) => {
  const response = await api.delete('/music/delete-uploaded-cover', { data });
  return response.data;
};
