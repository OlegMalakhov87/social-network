import { api } from '../../../shared/api';

/**
 * Зарегистрировать пользователя.
 *
 * @param {Object} formData - данные нового пользователя
 *
 * @returns {Promise<{Object}>}
 */
export const registerUser = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return response.data; // { user, token }
};

/**
 * Авторизовать пользователя.
 *
 * @param {Object} credentials - логин и пароль пользователя
 *
 * @returns {Promise<{Object}>}
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data; // { user, token }
};

/**
 * Получить данные текущего пользователя.
 *
 * Требует Authorization Bearer Token.
 *
 * @returns {Promise<{Object}>}
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data; // { user }
};

/**
 * Обновить профиль.
 *
 * @param {Object} userData - новые данные текущего пользователя
 *
 * @returns {Promise<{Object}>}
 */
export const updateCurrentUser = async (userData) => {
  const response = await api.patch('/profile/update', userData);
  return response.data; // { user }
};

/**
 * Удалить профиль.
 *
 * @returns {Promise<{Object}>}
 */
export const deleteCurrentUser = async () => {
  const response = await api.delete('/profile/delete');
  return response.data;
};

/**
 * Обновить пароль текущего пользователя.
 *
 *@param {Object} credentials - текущий и новый пароль пользователя
 *
 * @returns {Promise<{Object}>}
 */
export const changePasswordApi = async (credentials) => {
  const response = await api.patch('/profile/change-password', credentials);
  return response.data;
};
