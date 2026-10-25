import { configureStore } from '@reduxjs/toolkit';

import { getAccessTokenClaims } from '../../entities/auth/lib/accessToken';
import authReducer, {
  logout,
  setAccessToken,
} from '../../entities/auth/model/authSlice';
import { login } from '../../entities/auth/model/authThunks';
import { apiAxios, setupAxiosInterceptors } from './apiAxios';

const SESSION_ID = '11111111-1111-4111-8111-111111111111';
const SESSION_B = '22222222-2222-4222-8222-222222222222';

/**
 * Создаёт JWT для проверки.
 *
 * @param {number} version - Версия маркера доступа
 * @param {number} [userId=15] - Идентификатор пользователя
 * @param {string} [sessionId=SESSION_ID] - Идентификатор сессии
 * @param {number} [expiresInSeconds=3600] - Срок действия в секундах
 * @returns {string} Строка JWT.
 */
const createToken = (
  version,
  userId = 15,
  sessionId = SESSION_ID,
  expiresInSeconds = 3600
) => {
  /**
   * Кодирует часть JWT.
   *
   * @param {Object} value - Данные части JWT
   * @returns {string} Закодированная часть JWT.
   */
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');

  const now = Math.floor(Date.now() / 1000);

  return [
    encode({ alg: 'HS256', typ: 'JWT' }),
    encode({
      id: userId,
      sid: sessionId,
      iat: now - 10,
      exp: now + expiresInSeconds,
      version,
    }),
    'signature',
  ].join('.');
};

/**
 * Создаёт хранилище Redux с авторизованным состоянием.
 *
 * @param {string} token - Маркер доступа
 * @returns {Object} Хранилище с авторизованным состоянием.
 */
const createAuthenticatedStore = (token) => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });

  const requestId = 'test-login';

  const credentials = {
    email: 'test@example.com',
    password: 'test-password',
  };

  store.dispatch(login.pending(requestId, credentials));

  store.dispatch(
    login.fulfilled(
      {
        user: { id: 15, name: 'Test User' },
        token,
      },
      requestId,
      credentials
    )
  );

  return store;
};

describe('apiAxios: automatic token refresh', () => {
  const originalAdapter = apiAxios.defaults.adapter;

  afterEach(() => {
    apiAxios.defaults.adapter = originalAdapter;
    jest.restoreAllMocks();
  });

  test('при 401 обновляет JWT и повторяет исходный запрос', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn().mockResolvedValue({
      token: newToken,
    });

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    // Имитирует сервер без реальных HTTP-запросов.
    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      // Отклоняет первый запрос со старым JWT.
      if (authorization === `Bearer ${oldToken}`) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: { message: 'Access token expired' },
          },
          isAxiosError: true,
        });
      }

      // Принимает повторный запрос с новым JWT.
      return {
        config,
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      };
    };

    const response = await apiAxios.get('/test-protected');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });

    // Вызывает обновление сессии один раз.
    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Отправляет исходный HTTP-запрос и один повтор.
    expect(requests).toEqual([`Bearer ${oldToken}`, `Bearer ${newToken}`]);

    // Сохраняет в Redux новый маркер доступа.
    expect(store.getState().auth.token).toBe(newToken);

    // Оставляет пользователя авторизованным.
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user.id).toBe(15);
  });

  test('три одновременных 401 используют один refresh', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    // Управляет моментом завершения обновления сессии.
    let resolveRefresh;

    const refreshSession = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push({
        url: config.url,
        authorization,
      });

      if (authorization === `Bearer ${oldToken}`) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: { message: 'Access token expired' },
          },
          isAxiosError: true,
        });
      }

      return {
        config,
        data: { url: config.url, success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      };
    };

    // Запускает три запроса одновременно.
    const promises = [
      apiAxios.get('/profile'),
      apiAxios.get('/posts'),
      apiAxios.get('/notifications'),
    ];

    // Ожидает начала обновления сессии и не завершает его, пока остальные запросы не получат 401.
    await new Promise((resolve) => {
      const check = () => {
        if (refreshSession.mock.calls.length > 0) {
          resolve();
        } else {
          queueMicrotask(check);
        }
      };

      check();
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Завершает общее обновление сессии.
    resolveRefresh({ token: newToken });

    const responses = await Promise.all(promises);

    expect(responses).toHaveLength(3);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    // Сначала отправляет все три запроса со старым JWT.
    const initialRequests = requests.filter(
      (request) => request.authorization === `Bearer ${oldToken}`
    );

    expect(initialRequests).toHaveLength(3);

    // Повторяет все три запроса с новым JWT.
    const repeatedRequests = requests.filter(
      (request) => request.authorization === `Bearer ${newToken}`
    );

    expect(repeatedRequests).toHaveLength(3);

    // Обновляет Redux одним обновлением сессии.
    expect(store.getState().auth.token).toBe(newToken);
    expect(store.getState().auth.isAuthenticated).toBe(true);

    // Фиксирует единственный вызов обновления сессии.
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  test('logout во время refresh не восстанавливает авторизацию', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    let resolveRefresh;
    let notifyRefreshStarted;

    // Сообщает, что обновление сессии началось.
    const refreshStarted = new Promise((resolve) => {
      notifyRefreshStarted = resolve;
    });

    // Управляет завершением обновления сессии.
    const refreshSession = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
          notifyRefreshStarted();
        })
    );

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      if (authorization === `Bearer ${oldToken}`) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: { message: 'Access token expired' },
          },
          isAxiosError: true,
        });
      }

      return {
        config,
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      };
    };

    // Отправляет запрос, который получит ответ 401.
    const requestPromise = apiAxios.get('/test-protected');

    // Ожидает начала обновления сессии.
    await refreshStarted;

    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Завершает сессию до окончания обновления.
    store.dispatch(logout());

    // Возвращает с сервера новый JWT.
    resolveRefresh({ token: newToken });

    // Ожидает отказ продолжить старый запрос.
    await expect(requestPromise).rejects.toThrow(
      'Авторизация изменилась во время обновления токена'
    );

    const auth = store.getState().auth;

    expect(auth.token).toBeNull();
    expect(auth.user).toBeNull();
    expect(auth.isAuthenticated).toBe(false);

    // Не отправляет повторный HTTP-запрос.
    expect(requests).toEqual([`Bearer ${oldToken}`]);
  });

  test('повторный 401 не запускает второй refresh', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn().mockResolvedValue({
      token: newToken,
    });

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    // Отвечает с сервера кодом 401 на любой запрос.
    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      return Promise.reject({
        config,
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        isAxiosError: true,
      });
    };

    await expect(apiAxios.get('/test-protected')).rejects.toMatchObject({
      response: {
        status: 401,
      },
    });

    // Вызывает обновление сессии один раз при двух ответах 401.
    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Отправляет исходный запрос и ровно один повтор.
    expect(requests).toEqual([`Bearer ${oldToken}`, `Bearer ${newToken}`]);

    // Не считает временный отказ API признаком недействительной сессии.
    const auth = store.getState().auth;

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.token).toBe(newToken);
  });

  test('refresh 401 завершает текущую локальную авторизацию', async () => {
    const oldToken = createToken(1);

    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn().mockRejectedValue({
      response: {
        status: 401,
        data: {
          code: 'INVALID_REFRESH_TOKEN',
        },
      },
    });

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      requests.push(config.headers.get('Authorization'));

      return Promise.reject({
        config,
        response: {
          status: 401,
          data: {
            message: 'Access token expired',
          },
        },
        isAxiosError: true,
      });
    };

    await expect(apiAxios.get('/test-protected')).rejects.toMatchObject({
      response: {
        status: 401,
      },
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);

    const auth = store.getState().auth;

    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
    expect(auth.isAuthenticated).toBe(false);

    // Не выполняет повторный запрос API.
    expect(requests).toEqual([`Bearer ${oldToken}`]);
  });

  test('refresh 500 не завершает локальную авторизацию', async () => {
    const oldToken = createToken(1);

    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          message: 'Internal Server Error',
        },
      },
    });

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      requests.push(config.headers.get('Authorization'));

      return Promise.reject({
        config,
        response: {
          status: 401,
          data: {
            message: 'Access token expired',
          },
        },
        isAxiosError: true,
      });
    };

    await expect(apiAxios.get('/test-protected')).rejects.toMatchObject({
      response: {
        status: 500,
      },
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);

    const auth = store.getState().auth;

    // Не очищает Redux при ошибке сервера.
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user.id).toBe(15);
    expect(auth.token).toBe(oldToken);

    // Не отправляет повторный запрос API.
    expect(requests).toEqual([`Bearer ${oldToken}`]);
  });

  test('использует уже обновлённый JWT без повторного refresh', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn();

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
    });

    let rejectOriginalRequest;
    let notifyOriginalStarted;

    const originalStarted = new Promise((resolve) => {
      notifyOriginalStarted = resolve;
    });

    const requests = [];

    apiAxios.defaults.adapter = (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      // Отправляет первый запрос со старым JWT и задерживает ответ сервера.
      if (authorization === `Bearer ${oldToken}`) {
        return new Promise((resolve, reject) => {
          rejectOriginalRequest = () => {
            reject({
              config,
              response: {
                status: 401,
                data: {
                  message: 'Access token expired',
                },
              },
              isAxiosError: true,
            });
          };

          notifyOriginalStarted();
        });
      }

      // Принимает повторный запрос с актуальным JWT.
      return Promise.resolve({
        config,
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      });
    };

    // Отправляет запрос со старым JWT.
    const requestPromise = apiAxios.get('/test-protected');

    // Ожидает, пока запрос дойдёт до адаптера Axios.
    await originalStarted;

    // Обновляет маркер доступа другой операцией.
    store.dispatch(
      setAccessToken({
        token: newToken,
        expectedToken: oldToken,
      })
    );

    expect(store.getState().auth.token).toBe(newToken);

    // Возвращает старому запросу ответ 401.
    rejectOriginalRequest();

    const response = await requestPromise;

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });

    // Не вызывает повторное обновление сессии.
    expect(refreshSession).not.toHaveBeenCalled();

    // Повторяет запрос Axios с актуальным маркером доступа.
    expect(requests).toEqual([`Bearer ${oldToken}`, `Bearer ${newToken}`]);

    expect(store.getState().auth.token).toBe(newToken);
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  test('старый refresh не перезаписывает авторизацию другого пользователя', async () => {
    const oldToken = createToken(1);
    const refreshedOldToken = createToken(2);
    const newUserToken = createToken(1, 20, SESSION_B);

    const store = createAuthenticatedStore(oldToken);

    let resolveRefresh;
    let notifyRefreshStarted;

    const refreshStarted = new Promise((resolve) => {
      notifyRefreshStarted = resolve;
    });

    const refreshSession = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
          notifyRefreshStarted();
        })
    );

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      if (authorization === `Bearer ${oldToken}`) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: { message: 'Access token expired' },
          },
          isAxiosError: true,
        });
      }

      return {
        config,
        status: 200,
        statusText: 'OK',
        data: { success: true },
        headers: {},
      };
    };

    // Отправляет запрос пользователя A.
    const requestPromise = apiAxios.get('/test-protected');

    // Ожидает начала обновления старой сессии.
    await refreshStarted;

    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Меняет локальную авторизацию.
    store.dispatch(logout());

    const credentials = {
      email: 'another@example.com',
      password: 'test-password',
    };

    const requestId = 'new-user-login';

    store.dispatch(login.pending(requestId, credentials));

    store.dispatch(
      login.fulfilled(
        {
          user: { id: 20, name: 'Another User' },
          token: newUserToken,
        },
        requestId,
        credentials
      )
    );

    // Проверяет, что Redux уже содержит пользователя B.
    expect(store.getState().auth.user.id).toBe(20);
    expect(store.getState().auth.token).toBe(newUserToken);

    // Возвращает JWT пользователя A из запоздавшего обновления сессии.
    resolveRefresh({ token: refreshedOldToken });

    await expect(requestPromise).rejects.toThrow(
      'Авторизация изменилась во время обновления токена'
    );

    const auth = store.getState().auth;

    // Сохраняет авторизацию пользователя B.
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user.id).toBe(20);
    expect(auth.token).toBe(newUserToken);

    // Не повторяет старый запрос.
    expect(requests).toEqual([`Bearer ${oldToken}`]);

    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  test('обновляет действительно истёкший access token', async () => {
    const expiredToken = createToken(1, 15, SESSION_ID, -60);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(expiredToken);

    const refreshSession = jest.fn().mockResolvedValue({
      token: newToken,
    });

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      if (authorization === `Bearer ${expiredToken}`) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: { message: 'Access token expired' },
          },
          isAxiosError: true,
        });
      }

      return {
        config,
        status: 200,
        statusText: 'OK',
        data: { success: true },
        headers: {},
      };
    };

    const response = await apiAxios.get('/test-protected');

    expect(response.status).toBe(200);
    expect(refreshSession).toHaveBeenCalledTimes(1);

    expect(requests).toEqual([`Bearer ${expiredToken}`, `Bearer ${newToken}`]);

    expect(store.getState().auth.token).toBe(newToken);
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  test.each([
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/me',
  ])('%s не запускает автоматический refresh при 401', async (url) => {
    const oldToken = createToken(1);
    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn();

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      requests.push(config.url);

      return Promise.reject({
        config,
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        isAxiosError: true,
      });
    };

    await expect(apiAxios.get(url)).rejects.toMatchObject({
      response: { status: 401 },
    });

    // Не запускает обновление сессии для адреса авторизации.
    expect(refreshSession).not.toHaveBeenCalled();

    // Не отправляет повторные запросы.
    expect(requests).toEqual([url]);

    // Не завершает сессию в перехватчике.
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.token).toBe(oldToken);
  });

  test('запоздавший 401 старой сессии не затрагивает нового пользователя', async () => {
    const oldToken = createToken(1);
    const newUserToken = createToken(1, 20, SESSION_B);

    const store = createAuthenticatedStore(oldToken);
    const refreshSession = jest.fn();

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
    });

    let rejectOldRequest;
    let notifyStarted;

    const requestStarted = new Promise((resolve) => {
      notifyStarted = resolve;
    });

    const requests = [];

    apiAxios.defaults.adapter = (config) => {
      requests.push(config.headers.get('Authorization'));

      return new Promise((resolve, reject) => {
        rejectOldRequest = () =>
          reject({
            config,
            response: {
              status: 401,
              data: { message: 'Unauthorized' },
            },
            isAxiosError: true,
          });

        notifyStarted();
      });
    };

    // Отправляет запрос прежнего пользователя.
    const requestPromise = apiAxios.get('/test-protected');

    await requestStarted;

    // Меняет учётную запись, пока запрос выполняется.
    store.dispatch(logout());

    const credentials = {
      email: 'another@example.com',
      password: 'test-password',
    };

    const requestId = 'new-login-request';

    store.dispatch(login.pending(requestId, credentials));

    store.dispatch(
      login.fulfilled(
        {
          user: { id: 20, name: 'Another User' },
          token: newUserToken,
        },
        requestId,
        credentials
      )
    );

    // Возвращает ответ на старый запрос только сейчас.
    rejectOldRequest();

    await expect(requestPromise).rejects.toMatchObject({
      response: { status: 401 },
    });

    // Не запускает обновление сессии.
    expect(refreshSession).not.toHaveBeenCalled();

    // Не повторяет старый запрос от имени новой учётной записи.
    expect(requests).toEqual([`Bearer ${oldToken}`]);

    const auth = store.getState().auth;

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user.id).toBe(20);
    expect(auth.token).toBe(newUserToken);
  });

  test('SESSION_REVOKED завершает текущую авторизацию без refresh', async () => {
    const token = createToken(1);
    const store = createAuthenticatedStore(token);

    const refreshSession = jest.fn();
    const notifySessionRevoked = jest.fn();

    setupAxiosInterceptors(store, {
      refreshSession,
      notifySessionRevoked,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      requests.push(config.headers.get('Authorization'));

      return Promise.reject({
        config,
        response: {
          status: 401,
          data: {
            code: 'SESSION_REVOKED',
          },
        },
        isAxiosError: true,
      });
    };

    await expect(apiAxios.get('/test-protected')).rejects.toMatchObject({
      response: {
        status: 401,
        data: {
          code: 'SESSION_REVOKED',
        },
      },
    });

    // Не запускает обновление сессии при отзыве сессии.
    expect(refreshSession).not.toHaveBeenCalled();

    expect(notifySessionRevoked).toHaveBeenCalledTimes(1);
    expect(notifySessionRevoked).toHaveBeenCalledWith(token);

    // Не отправляет повторный запрос.
    expect(requests).toEqual([`Bearer ${token}`]);

    const auth = store.getState().auth;

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.token).toBeNull();
    expect(auth.user).toBeNull();
  });

  test('SESSION_REVOKED старой сессии не завершает новый аккаунт', async () => {
    const oldToken = createToken(1);
    const newUserToken = createToken(1, 20, SESSION_B);

    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn();
    const notifySessionRevoked = jest.fn();

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
      notifySessionRevoked,
    });

    let rejectOldRequest;
    let notifyRequestStarted;

    const requestStarted = new Promise((resolve) => {
      notifyRequestStarted = resolve;
    });

    const requests = [];

    apiAxios.defaults.adapter = (config) => {
      requests.push(config.headers.get('Authorization'));

      return new Promise((resolve, reject) => {
        rejectOldRequest = () =>
          reject({
            config,
            response: {
              status: 401,
              data: {
                code: 'SESSION_REVOKED',
              },
            },
            isAxiosError: true,
          });

        notifyRequestStarted();
      });
    };

    // Отправляет запрос пользователя A.
    const requestPromise = apiAxios.get('/test-protected');

    await requestStarted;

    // Меняет учётную запись, пока запрос выполняется.
    store.dispatch(logout());

    const credentials = {
      email: 'another@example.com',
      password: 'test-password',
    };

    const requestId = 'new-login-request';

    store.dispatch(login.pending(requestId, credentials));

    store.dispatch(
      login.fulfilled(
        {
          user: { id: 20, name: 'Another User' },
          token: newUserToken,
        },
        requestId,
        credentials
      )
    );

    expect(store.getState().auth.user.id).toBe(20);

    // Возвращает ошибку старой сессии только сейчас.
    rejectOldRequest();

    await expect(requestPromise).rejects.toMatchObject({
      response: {
        status: 401,
        data: {
          code: 'SESSION_REVOKED',
        },
      },
    });

    // Не запускает обновление сессии для старого запроса.
    expect(refreshSession).not.toHaveBeenCalled();

    expect(notifySessionRevoked).not.toHaveBeenCalled();

    // Не повторяет старый запрос.
    expect(requests).toEqual([`Bearer ${oldToken}`]);

    // Оставляет новую учётную запись авторизованной.
    const auth = store.getState().auth;

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user.id).toBe(20);
    expect(auth.token).toBe(newUserToken);
  });

  test('SESSION_REVOKED после retry завершает авторизацию', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    const refreshSession = jest.fn().mockResolvedValue({
      token: newToken,
    });

    setupAxiosInterceptors(store, {
      refreshSession,
      setAccessToken,
      getAccessTokenClaims,
      logout,
    });

    const requests = [];

    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      if (authorization === `Bearer ${oldToken}`) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: { code: 'TOKEN_EXPIRED' },
          },
          isAxiosError: true,
        });
      }

      if (authorization === `Bearer ${newToken}`) {
        return Promise.reject({
          config,
          response: {
            status: 401,
            data: { code: 'SESSION_REVOKED' },
          },
          isAxiosError: true,
        });
      }

      throw new Error('Неожиданный Authorization');
    };

    await expect(apiAxios.get('/test-protected')).rejects.toMatchObject({
      response: {
        status: 401,
        data: {
          code: 'SESSION_REVOKED',
        },
      },
    });

    // Выполняет обновление сессии ровно один раз.
    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Выполняет в Axios только один повтор.
    expect(requests).toEqual([`Bearer ${oldToken}`, `Bearer ${newToken}`]);

    // Завершает локальную авторизацию после SESSION_REVOKED.
    const auth = store.getState().auth;

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.token).toBeNull();
    expect(auth.user).toBeNull();
  });
});
