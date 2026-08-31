import { api } from '../../../shared/api';

/**
 * Получить данные о пользователе и статусе дружбы.
 *
 * @param {number} targetUserId - ID пользователя
 * @param {AbortSignal} signal - сигнал отмены запроса
 * @returns {Promise<Object>} { user, friendshipStatus, friendshipDirection, friendshipId }
 */
export const fetchUserProfileApi = async (targetUserId, signal) => {
  const response = await api.get(`/profile/${targetUserId}/with-friendship-status`, { signal });
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
  const response = await api.put(`/profile/update-privacy`, { isPublic });
  return response.data;
};
