import { apiFetch } from '../../../shared/api';

/**
 * API-функции для работы с пользователями.
 * Все запросы идут на базовый URL, который можно вынести в переменные окружения.
 */
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Получить пользователя по ID.
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export async function fetchUserById(userId) {
  const url = new URL(`${BASE_URL}/profile/${userId}`);
  const response = await apiFetch(url.toString());
  if (!response.ok) {
    throw new Error(`Ошибка загрузки пользователя: ${response.status}`);
  }
  return response.json();
}

/**
 * Получить всех пользователей (с пагинацией).
 * @param {Object} params - { page, limit }
 * @returns {Promise<Object>}
 */
export async function fetchAllUsers({ page = 1, limit = 30 } = {}) {
  const url = new URL(`${BASE_URL}/profile`);
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  const response = await apiFetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка загрузки пользователей: ${response.status}`);
  }
  return response.json();
}

/**
 * Получить статус пользователей в сети.
 * @param {Array} userIds
 * @returns {Promise<Object>}
 */
export async function fetchUsersOnlineStatus(userIds) {
  const response = await apiFetch(`${BASE_URL}/profile/online-status`, {
    method: 'POST',
    body: JSON.stringify({ userIds }),
  });
  if (!response.ok) throw new Error('Ошибка проверки онлайна');
  return response.json();
}
