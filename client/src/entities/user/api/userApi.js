import { api } from '../../../shared/api';

/**
 * Получить пользователя по ID.
 * @param {number} userId - ID пользователя
 * @param {AbortSignal} signal - сигнал отмены запроса
 * @returns {Promise<Object>} - пользователь
 */
export const fetchUserById = async (userId, signal) => {
  const response = await api.get(`/profile/${userId}`, { signal });
  return response.data;
};

/**
 * Получить всех пользователей (с пагинацией).
 * @param {Object} params - параметры запроса
 * @param {number} params.page - номер страницы
 * @param {number} params.limit - количество на странице
 * @param {AbortSignal} params.signal - сигнал отмены запроса
 * @returns {Promise<Array>} - массив пользователей
 */
export const fetchAllUsers = async ({ page, limit, signal } = {}) => {
  const response = await api.get(`/profile`, {
    params: { page, limit },
    signal,
  });
  return response.data;
};

/**
 * Получить статус пользователей в сети.
 * @param {Array} userIds - массив ID пользователей
 * @returns {Promise<Array>} - массив статусов пользователей
 */
export const fetchUsersOnlineStatus = async (userIds) => {
  const response = await api.post(`/profile/online-status`, { userIds });
  return response.data;
};

/**
 * Обновить приватность пользователя.
 * @param {boolean} isPublic - видимость пользователя
 * @returns {Promise<Object>} { isPublic }
 */
export const updateUserPrivacyApi = async (isPublic) => {
  const response = await api.put(`/profile/privacy`, { isPublic });
  return response.data;
};
