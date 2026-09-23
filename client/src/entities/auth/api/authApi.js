import { api } from '../../../shared/api';
import { UserSchema } from '../../user';

/**
 * Получить данные текущего пользователя.
 * @returns {Promise<{user: UserSchema}} {user}
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return { user: UserSchema.parse(response.data?.user) };
};

/**
 * Зарегистрировать пользователя.
 * @param {Object} formData - данные нового пользователя
 * @returns {Promise<{user: UserSchema, token: string}} {user, token}
 */
export const registerUser = async (formData) => {
  const response = await api.post('/auth/register', formData);
  return {
    user: UserSchema.parse(response.data?.user),
    token: response.data?.token,
  };
};

/**
 * Авторизовать пользователя.
 * @param {Object} credentials - логин и пароль пользователя
 * @returns {Promise<{user: UserSchema, token: string}} {user, token}
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return {
    user: UserSchema.parse(response.data?.user),
    token: response.data?.token,
  };
};
