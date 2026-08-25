import { api } from '../../../shared/api';

/**
 * Получить видео из библиотеки текущего пользователя.
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Promise<Object>} { items, pagination } - данные видео и пагинация
 */
export const fetchMyVideoLibrary = async ({
  page,
  limit,
  signal,
  sortKey,
} = {}) => {
  const response = await api.get(`/uservideolibrary`, {
    params: { page, limit, sortKey },
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
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Promise<Object>} { items, pagination }
 */
export const fetchUserVideoLibrary = async ({
  userId,
  page,
  limit,
  signal,
  sortKey,
} = {}) => {
  const response = await api.get(`/uservideolibrary/${userId}`, {
    params: {
      page,
      limit,
      sortKey,
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
  const response = await api.post(`/uservideolibrary/${videoId}/add`);
  return response.data;
};

/**
 * Обновить видео из библиотеки (добавить/удалить из избранного)
 * @param {number} libraryId – ID записи в библиотеке
 * @param {boolean} isFavorite – состояние в избраном
 * @returns {Promise<Object>} { libraryId }
 */
export const updateFavoriteVideo = async (libraryId, { isFavorite }) => {
  const response = await api.put(`/uservideolibrary/${libraryId}/favorite`, {
    isFavorite,
  });
  return response.data;
};

/**
 * Увеличить счетчик просмотров видео в библиотеке.
 * @param {number} libraryId - ID записи в библиотеке
 * @returns {Promise<Object>} { libraryId }
 */
export const incrementViewsCount = async (libraryId) => {
  const response = await api.put(`/uservideolibrary/${libraryId}/views`);
  return response.data;
};

/**
 * Удалить видео из библиотеки.
 * @param {number} libraryId – ID записи в библиотеке
 * @returns {Promise<Object>} { libraryId }
 */
export const deleteVideoFromLibrary = async (libraryId) => {
  const response = await api.delete(`/uservideolibrary/${libraryId}/delete`);
  return response.data;
};
