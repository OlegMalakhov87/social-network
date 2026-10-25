import { authAxios } from '../../../shared/api';
import { UserSchema } from '../../user';

/** Хранит общий Promise обновления маркера доступа. */
let refreshPromise = null;

/**
 * Возвращает текущего пользователя.
 *
 * @param {string} accessToken - Маркер доступа
 * @returns {Promise<{ user: Object }>} Текущий пользователь
 */
export const getCurrentUser = async (accessToken) => {
  const response = await authAxios.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return { user: UserSchema.parse(response.data?.user) };
};

/**
 * Регистрирует пользователя.
 *
 * @param {Object} formData - Данные нового пользователя
 * @returns {Promise<{ user: Object, token: string }>} Пользователь и маркер доступа
 */
export const registerUser = async (formData) => {
  const response = await authAxios.post('/auth/register', formData);
  return {
    user: UserSchema.parse(response.data?.user),
    token: response.data?.token,
  };
};

/**
 * Авторизует пользователя.
 *
 * @param {Object} credentials - Почта и пароль
 * @returns {Promise<{ user: Object, token: string }>} Пользователь и маркер доступа
 */
export const loginUser = async (credentials) => {
  const response = await authAxios.post('/auth/login', credentials);
  return {
    user: UserSchema.parse(response.data?.user),
    token: response.data?.token,
  };
};

/**
 * Возвращает новый маркер доступа по cookie.
 *
 * Повторные вызовы делят один HTTP-запрос, пока он не завершится.
 *
 * @returns {Promise<{ token: string }>} Новый маркер доступа
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
 * Завершает сессию на сервере.
 *
 * @param {string} sessionId - Идентификатор сессии
 * @returns {Promise<void>}
 */
export const logoutUser = async (sessionId) => {
  await authAxios.post('/auth/logout', {
    sessionId,
  });
};
