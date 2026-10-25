import axios from 'axios';

import { API_URL } from '../config';

export const apiAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let requestInterceptorId = null;
let responseInterceptorId = null;

/**
 * Проверяет, что авторизация остаётся устойчивой.
 *
 * @param {Object} auth - Состояние авторизации
 * @returns {boolean} Признак устойчивой сессии.
 */
const isStableAuth = (auth) =>
  auth?.isAuthenticated === true &&
  auth.isLoggingOut !== true &&
  auth.authCheckRequestId == null &&
  auth.authMutationRequestId == null;

/**
 * Проверяет, относится ли адрес к авторизации.
 *
 * @param {string} [url=''] - Адрес запроса
 * @returns {boolean} Признак адреса авторизации.
 */
const isAuthEndpoint = (url = '') => /(?:^|\/)auth(?:\/|$|\?)/.test(url);

/**
 * Извлекает маркер доступа из заголовка авторизации.
 *
 * @param {Object} config - Параметры запроса Axios
 * @returns {string|null} Маркер доступа или null.
 */
const getRequestToken = (config) => {
  const headers = config.headers;

  const authorization =
    typeof headers?.get === 'function'
      ? headers.get('Authorization')
      : (headers?.Authorization ?? headers?.authorization);

  if (
    typeof authorization !== 'string' ||
    !authorization.startsWith('Bearer ')
  ) {
    return null;
  }

  return authorization.slice(7);
};

/**
 * Настраивает перехватчики Axios для обновления сессии.
 *
 * @param {Object} store - Хранилище Redux
 * @param {Function} store.getState - Возвращает состояние
 * @param {Function} store.dispatch - Отправляет действие
 * @param {Object} dependencies - Зависимости перехватчиков
 * @param {Function} dependencies.refreshSession - Обновляет сессию
 * @param {Function} dependencies.setAccessToken - Записывает маркер доступа
 * @param {Function} dependencies.getAccessTokenClaims - Возвращает данные JWT
 * @param {Function} dependencies.logout - Завершает сессию
 * @param {Function} [dependencies.notifySessionRevoked] - Сообщает другим вкладкам об отзыве сессии
 * @returns {void}
 */
export const setupAxiosInterceptors = (
  store,
  {
    refreshSession,
    setAccessToken,
    getAccessTokenClaims,
    logout,
    notifySessionRevoked,
  }
) => {
  if (requestInterceptorId !== null) {
    apiAxios.interceptors.request.eject(requestInterceptorId);
  }

  if (responseInterceptorId !== null) {
    apiAxios.interceptors.response.eject(responseInterceptorId);
  }

  const pendingRefreshes = new Map();

  /**
   * Проверяет, что маркеры доступа принадлежат одной сессии.
   *
   * @param {string} firstToken - Первый маркер доступа
   * @param {string} secondToken - Второй маркер доступа
   * @returns {boolean} Признак совпадения пользователя и сессии.
   */
  const isSameSession = (firstToken, secondToken) => {
    const first = getAccessTokenClaims(firstToken);
    const second = getAccessTokenClaims(secondToken);

    return Boolean(
      first && second && first.id === second.id && first.sid === second.sid
    );
  };

  /**
   * Обновляет сессию и возвращает новый маркер доступа.
   * Повторные вызовы с тем же маркером разделяют один промис.
   *
   * @param {string} expectedToken - Маркер доступа исходного запроса
   * @returns {Promise<string>} Новый маркер доступа.
   */
  const refreshForToken = (expectedToken) => {
    const existing = pendingRefreshes.get(expectedToken);

    // Возвращает уже запущенное обновление сессии.
    if (existing) {
      return existing;
    }

    const promise = Promise.resolve()
      .then(() => refreshSession())
      .then(({ token }) => {
        if (typeof token !== 'string' || !token) {
          throw new Error('Сервер не вернул access token');
        }

        store.dispatch(
          setAccessToken({
            token,
            expectedToken,
          })
        );

        const auth = store.getState().auth;

        if (!isStableAuth(auth) || auth.token !== token) {
          throw new Error('Авторизация изменилась во время обновления токена');
        }

        return token;
      })
      .finally(() => {
        pendingRefreshes.delete(expectedToken);
      });

    pendingRefreshes.set(expectedToken, promise);

    return promise;
  };

  /**
   * Завершает текущую авторизацию и сообщает другим вкладкам.
   *
   * @param {string} expectedToken - Маркер доступа завершаемой сессии
   * @returns {void}
   */
  const logoutCurrentSession = (expectedToken) => {
    const auth = store.getState().auth;

    if (!isStableAuth(auth) || auth.token !== expectedToken) {
      return;
    }

    try {
      notifySessionRevoked?.(expectedToken);
    } catch (error) {
      console.warn('Не удалось уведомить вкладки об отзыве сессии', error);
    }

    store.dispatch(logout());
  };

  requestInterceptorId = apiAxios.interceptors.request.use(
    /**
     * Добавляет маркер доступа к запросу.
     *
     * @param {Object} config - Параметры запроса
     * @returns {Object|Promise<never>} Параметры запроса или отказ, если авторизация сменилась.
     */
    (config) => {
      const auth = store.getState().auth;

      if (
        config._authRetry &&
        (!isStableAuth(auth) || auth.token !== config._authRetryToken)
      ) {
        return Promise.reject(
          new Error('Авторизация изменилась перед повторным запросом')
        );
      }

      if (auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }

      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      return config;
    },
    /**
     * Отклоняет запрос, если подготовка завершилась ошибкой.
     *
     * @param {Error} error - Ошибка подготовки запроса
     * @returns {Promise<never>} Отклонённый промис.
     */
    (error) => Promise.reject(error)
  );

  responseInterceptorId = apiAxios.interceptors.response.use(
    /**
     * Возвращает успешный ответ без изменений.
     *
     * @param {Object} response - Ответ Axios
     * @returns {Object} Исходный ответ.
     */
    (response) => response,

    /**
     * Обновляет сессию после ответа 401 и повторяет исходный запрос.
     *
     * @param {Object} error - Ошибка ответа Axios
     * @returns {Promise<*>} Повторный ответ или отказ.
     */
    async (error) => {
      const config = error.config;

      if (
        error.response?.status !== 401 ||
        !config ||
        isAuthEndpoint(config.url)
      ) {
        return Promise.reject(error);
      }

      const failedToken = getRequestToken(config);
      const auth = store.getState().auth;

      if (!failedToken || !isStableAuth(auth)) {
        return Promise.reject(error);
      }

      if (error.response?.data?.code === 'SESSION_REVOKED') {
        logoutCurrentSession(failedToken);

        return Promise.reject(error);
      }

      if (config._authRetry) {
        return Promise.reject(error);
      }

      let retryToken;

      if (auth.token !== failedToken) {
        if (!isSameSession(failedToken, auth.token)) {
          return Promise.reject(error);
        }

        retryToken = auth.token;
      } else {
        try {
          retryToken = await refreshForToken(failedToken);
        } catch (refreshError) {
          if (refreshError.response?.status === 401) {
            logoutCurrentSession(failedToken);
          }
          return Promise.reject(refreshError);
        }
      }

      const currentAuth = store.getState().auth;

      if (
        !isStableAuth(currentAuth) ||
        currentAuth.token !== retryToken ||
        !isSameSession(failedToken, retryToken)
      ) {
        return Promise.reject(error);
      }

      config._authRetry = true;
      config._authRetryToken = retryToken;

      config.headers.Authorization = `Bearer ${retryToken}`;

      return apiAxios(config);
    }
  );
};
