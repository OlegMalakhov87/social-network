import { apiFetch } from '../../../shared/api';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Получить треки из библиотеки текущего пользователя.
 * @param {Object} [filters] – возможные фильтры (page, limit, visibility)
 * @returns {Promise<Object>} { tracks, pagination }
 */
export async function fetchMyMusicLibrary({ page = 1, limit = 30, visibility } = {}) {
  const url = new URL(`${BASE_URL}/usermusiclibrary`);
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  if (visibility) url.searchParams.set('visibility', visibility);

  const response = await apiFetch(url.toString());
  if (!response.ok) {
    throw new Error(`Ошибка загрузки треков: ${response.status}`);
  }
  return response.json();
}

/**
 * Добавить трек в библиотеку.
 * @param {number} trackId – ID трека, который добавляем
 */
export async function addTrackToLibrary(trackId) {
  const response = await apiFetch(`${BASE_URL}/usermusiclibrary`, {
    method: 'POST',
    body: JSON.stringify({ trackId }),
  });
  if (!response.ok) throw new Error(`Ошибка добавления трека в библиотеку: ${response.status}`);
  return response.json();
}

/**
 * Удалить трек из библиотеки.
 * @param {number} libraryId – ID записи в библиотеке
 */
export async function removeTrackFromLibrary(libraryId) {
  const response = await apiFetch(`${BASE_URL}/usermusiclibrary/${libraryId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(`Ошибка удаления трека из библиотеки: ${response.status}`);
  return response.json();
}

/**
 * Обновить трек из библиотеки (увеличить счетчик прослушиваний, добавить в избранное).
 * @param {number} libraryId – ID записи в библиотеке
 * @param {boolean} isFavorite – состояние в избраном (да/нет)
 * @param {number} playCount – счетчик прослушиваний личный
 */
export async function updateTrackFromLibrary(libraryId, { isFavorite, playCount }) {
  const response = await apiFetch(`${BASE_URL}/usermusiclibrary/${libraryId}`, {
    method: 'PUT',
    body: JSON.stringify({ isFavorite, playCount }),
  });
  if (!response.ok) throw new Error(`Ошибка обновления трека из библиотеки: ${response.status}`);
  return response.json();
}
