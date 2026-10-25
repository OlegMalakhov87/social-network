import { api } from '../../../shared/api';
import { VideoSchema, VideosListSchema } from '../model/videoSchema';

/**
 * Возвращает публичные видео с фильтром и поиском.
 *
 * @param {Object} params - Параметры запроса
 * @param {number} params.page - Номер страницы
 * @param {number} params.limit - Количество видео на странице
 * @param {string} params.filter - Фильтр категории
 * @param {string} [params.q] - Поисковый запрос
 * @param {AbortSignal} [params.signal] - Сигнал отмены запроса
 * @param {string} params.sortKey - Ключ сортировки
 * @returns {Promise<{ videos: Object[], pagination: Object }>} Видео и пагинация
 */
export const fetchVideosApi = async ({
  page,
  limit,
  filter,
  q,
  signal,
  sortKey,
}) => {
  const response = await api.get('/videos', {
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
    videos: VideosListSchema.parse(response.data?.videos),
    pagination: response.data?.pagination,
  };
};

/**
 * Загружает новое видео.
 *
 * @param {Object} formData - Поля видео
 * @returns {Promise<Object>} Видео
 */
export const addVideoApi = async (formData) => {
  const response = await api.post('/videos/add', formData);
  return VideoSchema.parse(response.data?.video);
};

/**
 * Загружает файл видео.
 *
 * @param {FormData} formData - Файл видео
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadVideoApi = async (formData, config) => {
  const response = await api.post('/videos/upload-video', formData, config);
  return response.data;
};

/**
 * Загружает обложку видео.
 *
 * @param {FormData} formData - Файл обложки
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadVideoThumbnailApi = async (formData, config) => {
  const response = await api.post('/videos/upload-thumbnail', formData, config);
  return response.data;
};

/**
 * Загружает превью видео.
 *
 * @param {FormData} formData - Файл превью
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadVideoPreviewApi = async (formData, config) => {
  const response = await api.post('/videos/upload-preview', formData, config);
  return response.data;
};

/**
 * Обновляет видео.
 *
 * @param {number} videoId - Идентификатор видео
 * @param {Object} updates - Поля видео
 * @returns {Promise<Object>} Видео
 */
export const updateVideoApi = async (videoId, updates) => {
  const response = await api.put(`/videos/${videoId}/update`, updates);
  return VideoSchema.parse(response.data?.video);
};

/**
 * Обновляет приватность видео.
 *
 * @param {boolean} isPublic - Признак публичности видео
 * @returns {Promise<Object>} Ответ сервера
 */
export const updateVideosPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/videos/update-privacy`, { isPublic });
  return response.data;
};

/**
 * Увеличивает счётчик просмотров видео.
 *
 * @param {number} videoId - Идентификатор видео
 * @returns {Promise<Object>} Ответ сервера
 */
export const incrementVideoViewsCountApi = async (videoId) => {
  const response = await api.patch(`/videos/${videoId}/views`);
  return response.data;
};

/**
 * Удаляет видео.
 *
 * @param {number} videoId - Идентификатор видео
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteVideoApi = async (videoId) => {
  const response = await api.delete(`/videos/${videoId}/delete`);
  return response.data;
};

/**
 * Удаляет загруженные файлы видео.
 *
 * @param {Object} data - Адреса видео, превью и обложки
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedVideoApi = async (data) => {
  const response = await api.delete('/videos/delete-uploaded-video', { data });
  return response.data;
};

/**
 * Удаляет загруженные превью видео.
 *
 * @param {Object} data - Данные превью
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedPreviewApi = async (data) => {
  const response = await api.delete('/videos/delete-uploaded-preview', {
    data,
  });
  return response.data;
};

/**
 * Удаляет загруженные обложки видео.
 *
 * @param {Object} data - Данные обложки
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedThumbnailApi = async (data) => {
  const response = await api.delete('/videos/delete-uploaded-thumb', {
    data,
  });
  return response.data;
};
