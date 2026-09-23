import { UserSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Получить данные о пользователе и статусе дружбы.
 *
 * @param {number} targetUserId - ID пользователя
 * @param {AbortSignal} signal - сигнал отмены запроса
 * @returns {Promise<UserSchema>} user
 */
export const fetchUserProfileApi = async (targetUserId, signal) => {
  const response = await api.get(
    `/profile/${targetUserId}/with-friendship-status`,
    { signal }
  );
  return UserSchema.parse(response.data?.user);
};

/**
 * Получить статус пользователей в сети.
 * @param {Array} userIds - массив ID пользователей
 * @returns {Promise<Array>} - массив статусов пользователей [{userId,online:boolean}]
 */
export const fetchUsersOnlineStatus = async (userIds) => {
  const response = await api.post(`/profile/online-status`, { userIds });
  return response.data;
};

/**
 * Загрузить аватар.
 * @param {FormData} formData - формат данных аватара
 * @param {Object} config - конфигурация запроса
 * @returns {Promise<{Object}>} { avatarUrl }
 */
export const uploadAvatarApi = async (formData, config) => {
  const response = await api.post('/profile/upload-avatar', formData, config);
  return response.data;
};

/**
 * Обновить профиль.
 * @param {Object} userData - новые данные текущего пользователя
 * @returns {Promise<UserSchema>} user
 */
export const updateCurrentUser = async (userData) => {
  const response = await api.put('/profile/update', userData);
  return { user: UserSchema.parse(response.data?.user) }; // (Thunk API)
};

/**
 * Обновить приватность пользователя.
 * @param {boolean} isPublic - видимость пользователя
 * @returns {Promise<Object>} { message, isPublic }
 */
export const updateUserPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/profile/update-privacy`, { isPublic });
  return response.data;
};

/**
 * Обновить пароль текущего пользователя.
 * @param {Object} credentials - текущий и новый пароль пользователя
 * @returns {Promise<{Object}>} { message }
 */
export const changePasswordApi = async (credentials) => {
  const response = await api.patch('/profile/change-password', credentials);
  return response.data;
};

/**
 * Удалить профиль.
 * @returns {Promise<{Object}>} { message, userId }
 */
export const deleteCurrentUser = async () => {
  const response = await api.delete('/profile/delete');
  return response.data;
};

/**
 * Удалить загруженный аватар.
 * @param {Object} data - данные аватара
 * @returns {Promise<Object>} { message }
 */
export const deleteUploadedAvatarApi = async (data) => {
  const response = await api.delete('/profile/delete-uploaded-avatar', {
    data,
  });
  return response.data;
};
