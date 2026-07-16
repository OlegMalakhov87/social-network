import { api } from '../../../shared/api';

/**
 * Получить пользователя по ID.
 * @param {number} userId
 * @returns {Promise<Object>} - пользователь
 */
export async function fetchUserById({ userId, signal } = {}) {
  const response = await api.get(`/profile/${userId}`, { signal });
  return response.data;
}

/**
 * Получить всех пользователей (с пагинацией).
 * @param {Object} params - { page, limit }
 * @returns {Promise<Array>} - массив пользователей
 */
export async function fetchAllUsers({ page, limit, signal } = {}) {
  const response = await api.get(`/profile`, {
    params: { page, limit },
    signal,
  });
  return response.data;
}

/**
 * Получить статус пользователей в сети.
 * @param {Array} userIds - массив ID пользователей
 * @returns {Promise<Array>} - массив статусов пользователей
 */
export async function fetchUsersOnlineStatus(userIds) {
  const response = await api.post(`/profile/online-status`, {
    data: { userIds },
  });
  return response.data;
}
