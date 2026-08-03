import { api } from '../../../shared/api';

/**
 * Получить видео из библиотеки текущего пользователя.
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { videos, pagination } - данные видео и пагинация
 */
export const fetchMyVideoLibrary = async ({ page, limit, signal }) => {
  const response = await api.get(`/uservideolibrary`, {
    params: { page, limit },
    signal,
  });
  return response.data;
};

/**
 * Получить видео для вкладки "Видео" на странице просматриваемого профиля.
 * @param {Object} params - параметры запроса
 * @param {number} params.userId - ID пользователя, библиотеку которого просматриваем
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Object>} { items, pagination }
 */
export const fetchUserVideoLibrary = async ({
  userId,
  page,
  limit,
  signal,
}) => {
  const response = await api.get(`/videos/profile/${userId}`, {
    params: {
      page,
      limit,
    },
    signal,
  });
  return response.data;
};

/**
 * Добавить видео в библиотеку.
 * @param {number} videoId – ID видео, которое добавляем
 * @returns {Promise<Object>} { libraryId }
 */
export const addVideoToLibrary = async (videoId) => {
  const response = await api.post(`/uservideolibrary`, {
    videoId,
  });
  return response.data;
};

/**
 * Обновить видео из библиотеки (увеличить счетчик просмотров, добавить в избранное)
 * @param {Object} params - параметры запроса
 * @param {number} params.libraryId – ID записи в библиотеке
 * @param {boolean} params.isFavorite – состояние в избраном (true/false)
 * @param {number} params.viewsCount – счетчик просмотров личный
 * @param {Date} params.lastWatchedAt - последний просмотр (дата)
 * @returns {Promise<Object>} { libraryId }
 */
export const updateVideoFromLibrary = async ({
  libraryId,
  isFavorite,
  viewsCount,
  lastWatchedAt,
}) => {
  const response = await api.put(`/uservideolibrary/${libraryId}`, {
    isFavorite,
    viewsCount,
    lastWatchedAt,
  });
  return response.data;
};

/**
 * Удалить видео из библиотеки.
 * @param {number} libraryId – ID записи в библиотеке
 * @returns {Promise<Object>} { libraryId }
 */
export const deleteVideoFromLibrary = async (libraryId) => {
  const response = await api.delete(`/uservideolibrary/${libraryId}`);
  return response.data;
};
