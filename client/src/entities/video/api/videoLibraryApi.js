import { apiFetch } from '../../../shared/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Получить видео из библиотеки текущего пользователя.
 * @param {Object} [filters] – возможные фильтры (page, limit, visibility)
 * @returns {Promise<Object>} { videos, pagination }
 */
export async function fetchMyVideoLibrary({ page = 1, limit = 30, visibility } = {}) {
  const url = new URL(`${BASE_URL}/uservideolibrary`);
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  if (visibility) url.searchParams.set('visibility', visibility);

  const response = await apiFetch(url.toString());
  if (!response.ok) {
    throw new Error(`Ошибка загрузки видео: ${response.status}`);
  }
  return response.json();
}

/**
 * Добавить видео в библиотеку.
 * @param {number} videoId – ID видео, которое добавляем
 */
export async function addVideoToLibrary(videoId) {
  const response = await apiFetch(`${BASE_URL}/uservideolibrary`, {
    method: 'POST',
    body: JSON.stringify({ videoId }),
  });
  if (!response.ok) throw new Error(`Ошибка добавления видео в библиотеку: ${response.status}`);
  return response.json();
}

/**
 * Удалить видео из библиотеки.
 * @param {number} libraryId – ID записи в библиотеке
 */
export async function removeVideoFromLibrary(libraryId) {
  const response = await apiFetch(`${BASE_URL}/uservideolibrary/${libraryId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Ошибка удаления видео из библиотеки: ${response.status}`);
  return response.json();
}

/**
 * Обновить видео из библиотеки (увеличить счетчик просмотров, добавить в избранное).
 * @param {number} libraryId – ID записи в библиотеке
 * @param {boolean} isFavorite – состояние в избраном (да/нет)
 * @param {number} watchCount – счетчик просмотров личный
 * @param {string} lastWatchedAt - последний просмотр (дата)
 */
export async function updateVideoFromLibrary(libraryId, { isFavorite, viewCount, lastWatchedAt }) {
  const response = await apiFetch(`${BASE_URL}/uservideolibrary/${libraryId}`, {
    method: 'PUT',
    body: JSON.stringify({ isFavorite, viewCount, lastWatchedAt }),
  });
  if (!response.ok) throw new Error(`Ошибка обновления видео из библиотеки: ${response.status}`);
  return response.json();
}
