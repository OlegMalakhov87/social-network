import { api } from '../../../shared/api';
import { VideosListSchema } from '../model/videoSchema';

/**
 * Возвращает видео библиотеки текущего пользователя.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @param {string} [params.sortKey] - Ключ сортировки
 * @returns {Promise<{ videos: Object[], pagination: Object }>} Видео и пагинация
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
  return {
    videos: VideosListSchema.parse(response.data?.videos),
    pagination: response.data?.pagination,
  };
};

/**
 * Возвращает видео библиотеки выбранного профиля.
 *
 * @param {Object} [params={}] - Параметры запроса
 * @param {number} [params.userId] - Идентификатор пользователя
 * @param {number} [params.page] - Номер страницы
 * @param {number} [params.limit] - Количество на странице
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @param {string} [params.sortKey] - Ключ сортировки
 * @returns {Promise<{ videos: Object[], pagination: Object }>} Видео и пагинация
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
  return {
    videos: VideosListSchema.parse(response.data?.videos),
    pagination: response.data?.pagination,
  };
};

/**
 * Добавляет видео в библиотеку.
 *
 * @param {number} videoId - Идентификатор видео
 * @returns {Promise<Object>} Ответ сервера
 */
export const addVideoToLibrary = async (videoId) => {
  const response = await api.post(`/uservideolibrary/${videoId}/add`);
  return response.data;
};

/**
 * Обновляет признак избранного в библиотеке видео.
 *
 * @param {number} libraryId - Идентификатор записи библиотеки
 * @param {Object} favorite - Изменения избранного
 * @param {boolean} favorite.isFavorite - Признак избранного
 * @returns {Promise<Object>} Ответ сервера
 */
export const updateFavoriteVideo = async (libraryId, { isFavorite }) => {
  const response = await api.patch(`/uservideolibrary/${libraryId}/favorite`, {
    isFavorite,
  });
  return response.data;
};

/**
 * Увеличивает счётчик просмотров записи библиотеки.
 *
 * @param {number} libraryId - Идентификатор записи библиотеки
 * @returns {Promise<Object>} Ответ сервера
 */
export const incrementViewsCount = async (libraryId) => {
  const response = await api.patch(`/uservideolibrary/${libraryId}/views`);
  return response.data;
};

/**
 * Удаляет видео из библиотеки.
 *
 * @param {number} libraryId - Идентификатор записи библиотеки
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteVideoFromLibrary = async (libraryId) => {
  const response = await api.delete(`/uservideolibrary/${libraryId}/delete`);
  return response.data;
};
