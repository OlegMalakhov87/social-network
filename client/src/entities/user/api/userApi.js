import { api } from '../../../shared/api';

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
