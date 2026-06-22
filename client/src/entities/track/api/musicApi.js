import { apiAxios } from '../../../shared/api';

/**
 * Получить все публичные треки с возможностью фильтрации.
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=30]
 * @param {string} [params.genre] – жанр
 * @param {string} [params.q] – поисковый запрос
 * @returns {Promise<Object>} { tracks, pagination }
 */
export async function fetchTracks({ page = 1, limit = 30, genre, q } = {}) {
  const response = await apiAxios.get('/music', {
    params: {
      page,
      limit,
      genre: genre === 'All' ? undefined : genre,
      q: q?.trim() || undefined,
    },
  });
  return response.data;
}

/**
 * Получить треки для вкладки "Треки" на странице просматриваемого профиля.
 * @param {number} profileUserId - ID профиля, который просматриваем
 * @param {Object} [filters]
 * @returns {Promise<Object>}
 */
export async function fetchUserMusicLibrary(
  profileUserId,
  { page = 1, limit = 30, visibility } = {}
) {
  const response = await apiAxios(`/music/profile/${profileUserId}`, {
    params: {
      page,
      limit,
    },
  });
  return response.data;
}

/**
 * Получить один трек по ID (нереализовано, возможно в будущем)
 * @param {number} trackId
 * @returns {Promise<Object>}
 */
export async function fetchTrackById(trackId) {
  const response = await apiAxios.get(`/music/${trackId}`);
  return response.data;
}

/**
 * Загрузить новый трек.
 * @param {Object} formData – поля трека (title, artist, fileUrl, genre, album, year, duration, description, isPublic)
 * @returns {Promise<Object>}
 */
export async function createTrack(formData) {
  const response = await apiAxios.post('/music', formData);
  return response.data;
}

/**
 * Обновить трек (счетчик прослушиваний на странице музыки).
 * @param {number} trackId
 * @param {Object} updates
 * @returns {Promise<Object>}
 */
export async function incrementGlobalPlayCount(trackId) {
  const response = await apiAxios.put(`/music/${trackId}`);
  return response.data;
}

/**
 * Удалить трек.
 * @param {number} trackId
 * @returns {Promise<Object>}
 */
export async function deleteTrack(trackId) {
  const response = await apiAxios.delete(`/music/${trackId}`);
  return response.data;
}
