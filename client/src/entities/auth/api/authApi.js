import { api, authAxios } from '../../../shared/api';
import { UserSchema } from '../../user';

// Promise для кеширования refresh запроса
let refreshPromise = null;

/**
 * Получить данные текущего пользователя.
 * @param {string} accessToken - access token пользователя
 * @returns {Promise<{user: UserSchema}} {user}
 */
export const getCurrentUser = async (accessToken) => {
  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
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

/**
 * Получить новый access token через refresh cookie.
 *
 * @returns {Promise<{token: string}} {token}
 */
export const refreshAuth = () => {
  if (!refreshPromise) {
    refreshPromise = authAxios
      .post('/auth/refresh')
      .then(({ data }) => ({
        token: data?.token,
      }))
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

/**
 * Завершить refresh-сессию на сервере.
 *
 * @param {string} sessionId - идентификатор сессии
 * @returns {Promise<void>}
 */
export const logoutUser = async (sessionId) => {
  await authAxios.post('/auth/logout', {
    sessionId,
  });
};
