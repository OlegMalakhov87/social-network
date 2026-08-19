import { api } from '../../../shared/api';

/**
 * Получить треки из библиотеки текущего пользователя.
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Promise<Object>} { items, pagination }
 */
export const fetchMyMusicLibrary = async ({
  page,
  limit,
  signal,
  sortKey,
} = {}) => {
  const response = await api.get(`/usermusiclibrary`, {
    params: { page, limit, sortKey },
    signal,
  });
  return response.data;
};

/**
 * Получить треки из библиотеки просматриваемого профиля.
 * @param {Object} params - параметры запроса
 * @param {number} params.userId - ID пользователя, библиотеку которого просматриваем
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Promise<Object>} { items, pagination }
 */
export const fetchUserMusicLibrary = async ({
  userId,
  page,
  limit,
  signal,
  sortKey,
} = {}) => {
  const response = await api.get(`/music/profile/${userId}`, {
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
 * Добавить трек в библиотеку.
 * @param {number} trackId - ID трека, который добавляем
 * @returns {Promise<Object>} { libraryId }
 */
export const addTrackToLibrary = async (trackId) => {
  const response = await api.post(`/usermusiclibrary/${trackId}/add`);
  return response.data;
};

/**
 * Обновить трек из библиотеки (добавить/удалить из избранного).
 * @param {number} libraryId - ID записи в библиотеке
 * @param {boolean} isFavorite - состояние в избраном
 * @returns {Promise<Object>} { libraryId }
 */
export const updateFavoriteTrack = async (libraryId, { isFavorite }) => {
  const response = await api.put(`/usermusiclibrary/${libraryId}/favorite`, {
    isFavorite,
  });
  return response.data;
};

/**
 * Увеличить счетчик прослушиваний трека из библиотеки.
 * @param {number} libraryId - ID записи в библиотеке
 * @returns {Promise<Object>} { libraryId }
 */
export const incrementPlaysCount = async (libraryId) => {
  const response = await api.put(`/usermusiclibrary/${libraryId}/plays`);
  return response.data;
};

/**
 * Удалить трек из библиотеки.
 * @param {number} libraryId - ID записи в библиотеке
 * @returns {Promise<Object>} { libraryId }
 */
export const deleteTrackFromLibrary = async (libraryId) => {
  const response = await api.delete(`/usermusiclibrary/${libraryId}/delete`);
  return response.data;
};
