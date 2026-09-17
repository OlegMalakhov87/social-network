import { api } from '../../../shared/api';
import { unwrapApiEntity } from '../../../shared/lib';

/**
 * Получить все публичные видео с возможностью фильтрации по категории и поиску.
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество видео на странице
 * @param {string} params.filter - фильтр по категории
 * @param {string} [params.q] - поисковый запрос
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @param {string} params.sortKey - ключ сортировки
 * @returns {Promise<Object>} { videos, pagination } - данные видео и пагинация
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
  return response.data;
};

/**
 * Загрузить новое видео.
 * @param {Object} formData – поля видео
 * @returns {Promise<Object>} { video }
 */
export const addVideoApi = async (formData) => {
  const response = await api.post('/videos/add', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Загрузить медиа файл для видео.
 * @param {FormData} formData - формат данных медиа файла
 * @returns {Promise<{Object}>} { videoUrl }
 */
export const uploadVideoApi = async (formData) => {
  const response = await api.post('/videos/upload-video', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Загрузить медиа файл для обложки видео.
 * @param {FormData} formData - формат данных медиа файла
 * @returns {Promise<{Object}>} { thumbnailUrl }
 */
export const uploadVideoThumbnailApi = async (formData) => {
  const response = await api.post('/videos/upload-thumbnail', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Загрузить медиа файл для превью видео.
 * @param {FormData} formData - формат данных медиа файла
 * @returns {Promise<{Object}>} { previewUrl }
 */
export const uploadVideoPreviewApi = async (formData) => {
  const response = await api.post('/videos/upload-preview', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить видео.
 * @param {number} videoId - ID видео
 * @param {Object} updates - поля видео
 * @returns {Promise<Object>} { video }
 */
export const updateVideoApi = async (videoId, updates) => {
  const response = await api.put(`/videos/${videoId}/update`, updates);
  return unwrapApiEntity(response.data);
};

/**
 * Обновить приватность видео.
 * @param {boolean} isPublic - видимость видео
 * @returns {Promise<Object>} { message, videos }
 */
export const updateVideosPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/videos/update-privacy`, { isPublic });
  return unwrapApiEntity(response.data);
};

/**
 * Инкрементировать счетчик просмотров видео.
 * @param {number} videoId - ID видео
 * @returns {Promise<Object>} { success, viewsCount }
 */
export const incrementVideoViewsCountApi = async (videoId) => {
  const response = await api.patch(`/videos/${videoId}/views`);
  return unwrapApiEntity(response.data);
};

/**
 * Удалить видео.
 * @param {number} videoId - ID видео
 * @returns {Promise<Object>} { message, videoId }
 */
export const deleteVideoApi = async (videoId) => {
  const response = await api.delete(`/videos/${videoId}/delete`);
  return unwrapApiEntity(response.data);
};

/**
 * Удалить (очистка мусора) загруженные медиа файлы.
 * @param {Object} data - данные медиа файлов (videoUrl, previewUrl, thumbnailUrl)
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedVideoApi = async (data) => {
  const response = await api.delete('/videos/delete-uploaded-video', { data });
  return unwrapApiEntity(response.data);
};

/**
 * Удалить загруженные медиа превью.
 * @param {Object} data - данные превью
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedPreviewApi = async (data) => {
  const response = await api.delete('/videos/delete-uploaded-preview', {
    data,
  });
  return unwrapApiEntity(response.data);
};

/**
 * Удалить загруженные медиа thumbnail.
 * @param {Object} data - данные thumbnail
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedThumbnailApi = async (data) => {
  const response = await api.delete('/videos/delete-uploaded-thumb', {
    data,
  });
  return unwrapApiEntity(response.data);
};
