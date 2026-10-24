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

/** Проверяем, что авторизация не меняется. */
const isStableAuth = (auth) =>
  auth?.isAuthenticated === true &&
  auth.isLoggingOut !== true &&
  auth.authCheckRequestId == null &&
  auth.authMutationRequestId == null;

/** Запросы авторизации не запускают автоматический refresh. */
const isAuthEndpoint = (url = '') => /(?:^|\/)auth(?:\/|$|\?)/.test(url);

/** Извлекаем токен из Authorization. */
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
 * Настраивает Axios interceptors.
 *
 * @param {import('@reduxjs/toolkit').EnhancedStore} store
 * @param {Object} dependencies
 * @param {Function} dependencies.refreshSession
 * @param {Function} dependencies.setAccessToken
 * @param {Function} dependencies.getAccessTokenClaims
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

  const isSameSession = (firstToken, secondToken) => {
    const first = getAccessTokenClaims(firstToken);
    const second = getAccessTokenClaims(secondToken);

    return Boolean(
      first && second && first.id === second.id && first.sid === second.sid
    );
  };

  /**
   * Обновляет JWT и применяет его только к исходной
   * авторизации. Конкурентные вызовы разделяют Promise.
   */
  const refreshForToken = (expectedToken) => {
    const existing = pendingRefreshes.get(expectedToken);

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
   * Завершает только актуальную авторизацию
   * и уведомляет остальные вкладки.
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
    (error) => Promise.reject(error)
  );

  responseInterceptorId = apiAxios.interceptors.response.use(
    (response) => response,

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
