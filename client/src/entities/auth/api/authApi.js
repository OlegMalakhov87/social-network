import { api } from '../../../shared/api';
import { unwrapApiEntity } from '../../../shared/lib';

/**
 * Получить данные текущего пользователя.
 * @returns {Promise<{Object}>} { user }
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return unwrapApiEntity(response.data);
};

/**
 * Зарегистрировать пользователя.
 * @param {Object} formData - данные нового пользователя
 * @returns {Promise<{Object}>} { user, token }
 */
export const registerUser = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return unwrapApiEntity(response.data);
};

/**
 * Авторизовать пользователя.
 * @param {Object} credentials - логин и пароль пользователя
 * @returns {Promise<{Object}>} { user, token }
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return unwrapApiEntity(response.data);
};
