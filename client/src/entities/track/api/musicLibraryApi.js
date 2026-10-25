import { api } from '../../../shared/api';
import { TracksListSchema } from '../model/trackSchema';

/**
 * Возвращает треки библиотеки текущего пользователя.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @param {string} [params.sortKey] - Ключ сортировки
 * @returns {Promise<{ tracks: Object[], pagination: Object }>} Треки и пагинация
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
  return {
    tracks: TracksListSchema.parse(response.data?.tracks),
    pagination: response.data?.pagination,
  };
};

/**
 * Возвращает треки библиотеки выбранного профиля.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {number} [params.userId] - Идентификатор пользователя
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @param {string} [params.sortKey] - Ключ сортировки
 * @returns {Promise<{ tracks: Object[], pagination: Object }>} Треки и пагинация
 */
export const fetchUserMusicLibrary = async ({
  userId,
  page,
  limit,
  signal,
  sortKey,
} = {}) => {
  const response = await api.get(`/usermusiclibrary/${userId}`, {
    params: {
      page,
      limit,
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
 * Добавляет трек в библиотеку.
 *
 * @param {number} trackId - Идентификатор трека
 * @returns {Promise<Object>} Ответ сервера
 */
export const addTrackToLibrary = async (trackId) => {
  const response = await api.post(`/usermusiclibrary/${trackId}/add`);
  return response.data;
};

/**
 * Обновляет признак избранного в библиотеке треков.
 *
 * @param {number} libraryId - Идентификатор записи библиотеки
 * @param {Object} favorite - Изменения избранного
 * @param {boolean} favorite.isFavorite - Признак избранного
 * @returns {Promise<Object>} Ответ сервера
 */
export const updateFavoriteTrack = async (libraryId, { isFavorite }) => {
  const response = await api.patch(`/usermusiclibrary/${libraryId}/favorite`, {
    isFavorite,
  });
  return response.data;
};

/**
 * Увеличивает счётчик прослушиваний записи библиотеки.
 *
 * @param {number} libraryId - Идентификатор записи библиотеки
 * @returns {Promise<Object>} Ответ сервера
 */
export const incrementPlaysCount = async (libraryId) => {
  const response = await api.patch(`/usermusiclibrary/${libraryId}/plays`);
  return response.data;
};

/**
 * Удаляет трек из библиотеки.
 *
 * @param {number} libraryId - Идентификатор записи библиотеки
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteTrackFromLibrary = async (libraryId) => {
  const response = await api.delete(`/usermusiclibrary/${libraryId}/delete`);
  return response.data;
};
