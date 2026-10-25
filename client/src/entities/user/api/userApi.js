import { UserSchema } from '..';
import { api } from '../../../shared/api';

/**
 * Возвращает профиль пользователя и статус дружбы.
 *
 * @param {number} targetUserId - Идентификатор пользователя
 * @param {AbortSignal} [signal] - Сигнал отмены запроса
 * @returns {Promise<Object>} Пользователь
 */
export const fetchUserProfileApi = async (targetUserId, signal) => {
  const response = await api.get(
    `/profile/${targetUserId}/with-friendship-status`,
    { signal }
  );
  return UserSchema.parse(response.data?.user);
};

/**
 * Возвращает статусы пользователей в сети.
 *
 * @param {Array<number>} userIds - Идентификаторы пользователей
 * @returns {Promise<Object>} Статусы пользователей
 */
export const fetchUsersOnlineStatus = async (userIds) => {
  const response = await api.post(`/profile/online-status`, { userIds });
  return response.data;
};

/**
 * Загружает аватар.
 *
 * @param {FormData} formData - Файл аватара
 * @param {Object} config - Настройки запроса
 * @returns {Promise<Object>} Ответ сервера
 */
export const uploadAvatarApi = async (formData, config) => {
  const response = await api.post('/profile/upload-avatar', formData, config);
  return response.data;
};

/**
 * Обновляет профиль текущего пользователя.
 *
 * @param {Object} userData - Данные профиля
 * @returns {Promise<{ user: Object }>} Обновлённый пользователь
 */
export const updateCurrentUser = async (userData) => {
  const response = await api.put('/profile/update', userData);
  return { user: UserSchema.parse(response.data?.user) }; // Возвращает пользователя объектом для Redux.
};

/**
 * Обновляет приватность пользователя.
 *
 * @param {boolean} isPublic - Признак публичности профиля
 * @returns {Promise<Object>} Ответ сервера
 */
export const updateUserPrivacyApi = async (isPublic) => {
  const response = await api.patch(`/profile/update-privacy`, { isPublic });
  return response.data;
};

/**
 * Обновляет пароль текущего пользователя.
 *
 * @param {Object} credentials - Текущий и новый пароль
 * @returns {Promise<Object>} Ответ сервера
 */
export const changePasswordApi = async (credentials) => {
  const response = await api.patch('/profile/change-password', credentials);
  return response.data;
};

/**
 * Удаляет профиль текущего пользователя.
 *
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteCurrentUser = async () => {
  const response = await api.delete('/profile/delete');
  return response.data;
};

/**
 * Удаляет загруженный аватар.
 *
 * @param {Object} data - Данные аватара
 * @returns {Promise<Object>} Ответ сервера
 */
export const deleteUploadedAvatarApi = async (data) => {
  const response = await api.delete('/profile/delete-uploaded-avatar', {
    data,
  });
  return response.data;
};
