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
 * Создает токен авторизации для тестирования.
 */
const createToken = (
  version,
  userId = 15,
  sessionId = SESSION_ID,
  expiresInSeconds = 3600
) => {
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
 * Создает авторизованный store для тестирования.
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

    // Имитируем backend без реальных HTTP-запросов.
    apiAxios.defaults.adapter = async (config) => {
      const authorization = config.headers.get('Authorization');

      requests.push(authorization);

      // Первый запрос со старым JWT отклоняется.
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

      // Повторный запрос с новым JWT успешен.
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

    // Refresh выполнялся только один раз.
    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Было два HTTP-запроса:
    // первоначальный и повторный.
    expect(requests).toEqual([`Bearer ${oldToken}`, `Bearer ${newToken}`]);

    // Redux сохранил новый access token.
    expect(store.getState().auth.token).toBe(newToken);

    // Пользователь остался авторизованным.
    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user.id).toBe(15);
  });

  test('три одновременных 401 используют один refresh', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    // Управляем моментом завершения refresh вручную.
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

    // Запускаем три запроса одновременно.
    const promises = [
      apiAxios.get('/profile'),
      apiAxios.get('/posts'),
      apiAxios.get('/notifications'),
    ];

    // Дожидаемся начала refresh.
    // Не завершаем его, пока остальные запросы
    // тоже не получат 401.
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

    // Завершаем общий refresh.
    resolveRefresh({ token: newToken });

    const responses = await Promise.all(promises);

    expect(responses).toHaveLength(3);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    // Все три запроса сначала использовали OLD_TOKEN.
    const initialRequests = requests.filter(
      (request) => request.authorization === `Bearer ${oldToken}`
    );

    expect(initialRequests).toHaveLength(3);

    // Все три запроса повторились с NEW_TOKEN.
    const repeatedRequests = requests.filter(
      (request) => request.authorization === `Bearer ${newToken}`
    );

    expect(repeatedRequests).toHaveLength(3);

    // Единственный refresh обновил Redux.
    expect(store.getState().auth.token).toBe(newToken);
    expect(store.getState().auth.isAuthenticated).toBe(true);

    // Главное требование.
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  test('logout во время refresh не восстанавливает авторизацию', async () => {
    const oldToken = createToken(1);
    const newToken = createToken(2);

    const store = createAuthenticatedStore(oldToken);

    let resolveRefresh;
    let notifyRefreshStarted;

    // Сигнал, что refresh действительно начался.
    const refreshStarted = new Promise((resolve) => {
      notifyRefreshStarted = resolve;
    });

    // Управляем завершением refresh вручную.
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

    // Исходный запрос.
    const requestPromise = apiAxios.get('/test-protected');

    // Дожидаемся начала refresh.
    await refreshStarted;

    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Пользователь выходит до завершения refresh.
    store.dispatch(logout());

    // Теперь сервер возвращает новый JWT.
    resolveRefresh({ token: newToken });

    // Старый запрос не должен продолжиться.
    await expect(requestPromise).rejects.toThrow(
      'Авторизация изменилась во время обновления токена'
    );

    const auth = store.getState().auth;

    expect(auth.token).toBeNull();
    expect(auth.user).toBeNull();
    expect(auth.isAuthenticated).toBe(false);

    // Повторного HTTP-запроса не было.
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

    // Backend отвечает 401 на любой запрос.
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

    // Один refresh, несмотря на два ответа 401.
    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Исходный запрос + ровно один retry.
    expect(requests).toEqual([`Bearer ${oldToken}`, `Bearer ${newToken}`]);

    // Временный отказ API сам по себе не означает,
    // что refresh-сессия недействительна.
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

    // Повторного API-запроса не выполняли.
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

    // Ошибка сервера не должна очищать Redux.
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user.id).toBe(15);
    expect(auth.token).toBe(oldToken);

    // Повторного API-запроса нет.
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

      // Первый запрос отправлен со старым JWT.
      // Намеренно задерживаем ответ backend.
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

      // Повторный запрос с актуальным JWT.
      return Promise.resolve({
        config,
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
      });
    };

    // Отправляем запрос с TOKEN_A.
    const requestPromise = apiAxios.get('/test-protected');

    // Дожидаемся, пока запрос достигнет adapter.
    await originalStarted;

    // Другая операция уже обновила access token.
    store.dispatch(
      setAccessToken({
        token: newToken,
        expectedToken: oldToken,
      })
    );

    expect(store.getState().auth.token).toBe(newToken);

    // Только теперь старый запрос получает 401.
    rejectOriginalRequest();

    const response = await requestPromise;

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });

    // Самое важное: refresh больше не нужен.
    expect(refreshSession).not.toHaveBeenCalled();

    // Axios повторил запрос с актуальным токеном.
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

    // Пользователь A отправляет запрос.
    const requestPromise = apiAxios.get('/test-protected');

    // Дожидаемся начала refresh старой сессии.
    await refreshStarted;

    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Моделируем смену локальной авторизации.
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

    // Проверяем, что Redux уже содержит пользователя B.
    expect(store.getState().auth.user.id).toBe(20);
    expect(store.getState().auth.token).toBe(newUserToken);

    // Запоздалый refresh возвращает JWT пользователя A.
    resolveRefresh({ token: refreshedOldToken });

    await expect(requestPromise).rejects.toThrow(
      'Авторизация изменилась во время обновления токена'
    );

    const auth = store.getState().auth;

    // Авторизация пользователя B сохранилась.
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user.id).toBe(20);
    expect(auth.token).toBe(newUserToken);

    // Старый запрос не повторился.
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

    // Auth endpoint не запускает refresh.
    expect(refreshSession).not.toHaveBeenCalled();

    // Повторных запросов нет.
    expect(requests).toEqual([url]);

    // Interceptor не выполняет logout.
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

    // Старый пользователь отправляет запрос.
    const requestPromise = apiAxios.get('/test-protected');

    await requestStarted;

    // Пока запрос выполняется, меняем аккаунт.
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

    // Ответ на старый запрос приходит только сейчас.
    rejectOldRequest();

    await expect(requestPromise).rejects.toMatchObject({
      response: { status: 401 },
    });

    // Refresh не запускался.
    expect(refreshSession).not.toHaveBeenCalled();

    // Старый запрос не повторялся под новым аккаунтом.
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

    // Refresh вообще не запускается.
    expect(refreshSession).not.toHaveBeenCalled();

    expect(notifySessionRevoked).toHaveBeenCalledTimes(1);
    expect(notifySessionRevoked).toHaveBeenCalledWith(token);

    // Повторного запроса нет.
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

    // Отправляем запрос пользователя A.
    const requestPromise = apiAxios.get('/test-protected');

    await requestStarted;

    // Пока запрос выполняется, меняем аккаунт.
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

    // Только теперь приходит ошибка старой сессии.
    rejectOldRequest();

    await expect(requestPromise).rejects.toMatchObject({
      response: {
        status: 401,
        data: {
          code: 'SESSION_REVOKED',
        },
      },
    });

    // Старый запрос не запускает refresh.
    expect(refreshSession).not.toHaveBeenCalled();

    expect(notifySessionRevoked).not.toHaveBeenCalled();

    // Старый запрос не повторяется.
    expect(requests).toEqual([`Bearer ${oldToken}`]);

    // Новый аккаунт остаётся авторизованным.
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

    // Refresh успешно выполнился ровно один раз.
    expect(refreshSession).toHaveBeenCalledTimes(1);

    // Axios выполнил только один retry.
    expect(requests).toEqual([`Bearer ${oldToken}`, `Bearer ${newToken}`]);

    // После SESSION_REVOKED локальная авторизация завершена.
    const auth = store.getState().auth;

    expect(auth.isAuthenticated).toBe(false);
    expect(auth.token).toBeNull();
    expect(auth.user).toBeNull();
  });
});
