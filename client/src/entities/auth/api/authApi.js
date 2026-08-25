import { api } from '../../../shared/api';

/**
 * Получить данные текущего пользователя.
 * @returns {Promise<{Object}>} { user }
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Зарегистрировать пользователя.
 * @param {Object} formData - данные нового пользователя
 * @returns {Promise<{Object}>} { user, token }
 */
export const registerUser = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data;
};

/**
 * Авторизовать пользователя.
 * @param {Object} credentials - логин и пароль пользователя
 * @returns {Promise<{Object}>} { user, token }
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Обновить профиль.
 * @param {Object} userData - новые данные текущего пользователя
 * @returns {Promise<{Object}>} { user }
 */
export const updateCurrentUser = async (userData) => {
  const response = await api.patch('/profile/update', userData);
  return response.data;
};

/**
 * Удалить профиль.
 * @returns {Promise<{Object}>} { message }
 */
export const deleteCurrentUser = async () => {
  const response = await api.delete('/profile/delete');
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
 * Загрузить аватар текущего пользователя.
 * @param {File} file - файл аватара
 * @returns {Promise<{Object}>} { avatarUrl }
 */
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append('avatarUrl', file);
  const response = await api.post('/profile/upload-avatar', formData);
  return response.data;
};
