import { api } from '../../../shared/api';

/**
 * Получить треки из библиотеки текущего пользователя.
 * @param {Object} params - параметры запроса
 * @param {number} [params.page] - номер страницы
 * @param {number} [params.limit] - количество на странице
 * @param {AbortSignal} [params.signal] - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
 */
export async function fetchMyMusicLibrary({ page, limit, signal } = {}) {
  const response = await api.get(`/usermusiclibrary`, {
    params: { page, limit },
    signal,
  });
  return {
    items: response.data.tracks || [],
    pagination: response.data.pagination || {},
  };
}

/**
 * Получить треки из библиотеки просматриваемого профиля.
 * @param {Object} params - параметры запроса
 * @param {number} [params.userId] - ID пользователя, библиотеку которого просматриваем
 * @param {number} [params.page] - номер страницы
 * @param {number} [params.limit] - количество на странице
 * @param {AbortSignal} [params.signal] - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
 */
export async function fetchUserMusicLibrary({
  userId,
  page,
  limit,
  signal,
} = {}) {
  const response = await api.get(`/music/profile/${userId}`, {
    params: {
      page,
      limit,
    },
    signal,
  });
  return {
    items: response.data.tracks || [],
    pagination: response.data.pagination || {},
  };
}

/**
 * Добавить трек в библиотеку.
 * @param {number} trackId – ID трека, который добавляем
 * @returns {Promise<Object>} { libraryId }
 */
export async function addTrackToLibrary(trackId) {
  const response = await api.post(`/usermusiclibrary`, {
    trackId,
  });
  return response.data;
}

/**
 * Обновить трек из библиотеки (увеличить счетчик прослушиваний, добавить в избранное).
 * @param {number} libraryId – ID записи в библиотеке
 * @param {boolean} isFavorite – состояние в избраном (true/false)
 * @param {number} playCount – счетчик прослушиваний личный
 * @returns {Promise<Object>} { libraryId }
 */
export async function updateTrackFromLibrary({
  libraryId,
  isFavorite,
  playCount,
} = {}) {
  const response = await api.put(`/usermusiclibrary/${libraryId}`, {
    isFavorite,
    playCount,
  });
  return response.data;
}

/**
 * Удалить трек из библиотеки.
 * @param {number} libraryId – ID записи в библиотеке
 * @returns {Promise<Object>} { libraryId }
 */
export async function deleteTrackFromLibrary(libraryId) {
  const response = await api.delete(`/usermusiclibrary/${libraryId}`);
  return response.data;
}
