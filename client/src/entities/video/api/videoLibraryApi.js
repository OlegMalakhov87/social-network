import { api } from '../../../shared/api';

/**
 * Получить видео из библиотеки текущего пользователя.
 * @param {Object} params - параметры запроса
 * @param {number} [params.page] - номер страницы
 * @param {number} [params.limit] - количество на странице
 * @param {AbortSignal} [params.signal] - сигнал отмены запроса
 * @returns {Promise<Object>} { videos, pagination }
 */
export async function fetchMyVideoLibrary({ page, limit, signal } = {}) {
  const response = await api.get(`/uservideolibrary`, {
    params: { page, limit },
    signal,
  });
  return {
    items: response.data.videos || [],
    pagination: response.data.pagination || {},
  };
}

/**
 * Получить видео для вкладки "Видео" на странице просматриваемого профиля.
 * @param {number} userId - ID пользователя, библиотеку которого просматриваем
 * @param {Object} params - параметры запроса
 * @param {number} [params.page] - номер страницы
 * @param {number} [params.limit] - количество на странице
 * @param {AbortSignal} [params.signal] - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
 */
export async function fetchUserVideoLibrary({
  userId,
  page,
  limit,
  signal,
} = {}) {
  const response = await api.get(`/videos/profile/${userId}`, {
    params: {
      page,
      limit,
    },
    signal,
  });
  return {
    items: response.data.videos || [],
    pagination: response.data.pagination || {},
  };
}

/**
 * Добавить видео в библиотеку.
 * @param {number} videoId – ID видео, которое добавляем
 * @returns {Promise<Object>} { libraryId }
 */
export async function addVideoToLibrary(videoId) {
  const response = await api.post(`/uservideolibrary`, {
    videoId,
  });
  return response.data;
}

/**
 * Обновить видео из библиотеки (увеличить счетчик просмотров, добавить в избранное).
 * @param {number} libraryId – ID записи в библиотеке
 * @param {boolean} isFavorite – состояние в избраном (true/false)
 * @param {number} viewCount – счетчик просмотров личный
 * @param {Date} lastWatchedAt - последний просмотр (дата)
 * @returns {Promise<Object>} { libraryId }
 */
export async function updateVideoFromLibrary({
  libraryId,
  isFavorite,
  viewCount,
  lastWatchedAt,
} = {}) {
  const response = await api.put(`/uservideolibrary/${libraryId}`, {
    isFavorite,
    viewCount,
    lastWatchedAt,
  });
  return response.data;
}

/**
 * Удалить видео из библиотеки.
 * @param {number} libraryId – ID записи в библиотеке
 * @returns {Promise<Object>} { libraryId }
 */
export async function deleteVideoFromLibrary(libraryId) {
  const response = await api.delete(`/uservideolibrary/${libraryId}`);
  return response.data;
}
