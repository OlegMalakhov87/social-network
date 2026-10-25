import { configureStore } from '@reduxjs/toolkit';

import { getCurrentUser } from '../api/authApi';
import authReducer, { logout } from './authSlice';
import { checkAuth, login, logoutSession, register } from './authThunks';

/** Подменяет API авторизации. */
jest.mock('../api/authApi', () => ({
  getCurrentUser: jest.fn(),
  logoutUser: jest.fn(),
  refreshAuth: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

/**
 * Создаёт Promise, завершением которого управляет тест.
 *
 * @returns {{ promise: Promise<Object>, resolve: Function, reject: Function }} Отложенный Promise
 */
const createDeferred = () => {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
};

/**
 * Создаёт состояние Redux для проверки.
 *
 * @param {Object} coordinator - Координатор авторизации
 * @returns {import('@reduxjs/toolkit').EnhancedStore} Состояние Redux
 */

const createTestStore = (coordinator) =>
  configureStore({
    reducer: {
      auth: authReducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: {
            coordinator,
          },
        },
      }),
  });

/**
 * Создаёт координатор авторизации для проверки.
 *
 * @returns {Object} Методы координатора
 */
const createTestCoordinator = () => ({
  refreshSession: jest.fn(),
  endSession: jest.fn(),
  loginSession: jest.fn(),
  registerSession: jest.fn(),
});

/** Проверяет запросы авторизации. */
describe('authThunks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('checkAuth восстанавливает пользователя и access token', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    coordinator.refreshSession.mockResolvedValue({
      token: 'new-access-token',
    });

    const user = { id: 15, name: 'Test User' };

    getCurrentUser.mockResolvedValue({ user });

    await store.dispatch(checkAuth()).unwrap();

    expect(coordinator.refreshSession).toHaveBeenCalledTimes(1);

    expect(getCurrentUser).toHaveBeenCalledWith('new-access-token');

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user,
        token: 'new-access-token',
        isAuthenticated: true,
        isCheckingAuth: false,
        status: 'succeeded',
      })
    );
  });

  test('checkAuth очищает авторизацию при ошибке refresh', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    coordinator.refreshSession.mockRejectedValue({
      response: {
        status: 401,
        data: {
          message: 'Недействительная сессия',
        },
      },
    });

    await store.dispatch(checkAuth());

    expect(getCurrentUser).not.toHaveBeenCalled();

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        isCheckingAuth: false,
        status: 'failed',
      })
    );
  });

  test('logoutSession завершает сессию через координатор', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    coordinator.refreshSession.mockResolvedValue({
      token: 'access-token',
    });

    getCurrentUser.mockResolvedValue({
      user: { id: 15, name: 'Test User' },
    });

    await store.dispatch(checkAuth()).unwrap();

    coordinator.endSession.mockResolvedValue(undefined);

    await store.dispatch(logoutSession()).unwrap();

    expect(coordinator.endSession).toHaveBeenCalledTimes(1);

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
      })
    );
  });

  test('logoutSession сохраняет авторизацию при ошибке сервера', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    coordinator.refreshSession.mockResolvedValue({
      token: 'new-access-token',
    });

    const user = { id: 15, name: 'Test User' };

    getCurrentUser.mockResolvedValue({ user });

    await store.dispatch(checkAuth()).unwrap();

    coordinator.endSession.mockRejectedValue({
      response: {
        status: 500,
        data: {
          message: 'Ошибка сервера',
        },
      },
    });

    const action = await store.dispatch(logoutSession());

    expect(logoutSession.rejected.match(action)).toBe(true);

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user,
        token: 'new-access-token',
        isAuthenticated: true,
        status: 'failed',
      })
    );
  });

  test('устаревший checkAuth не восстанавливает авторизацию после logout', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    const deferredRefresh = createDeferred();
    const deferredLogout = createDeferred();

    coordinator.refreshSession.mockReturnValue(deferredRefresh.promise);
    coordinator.endSession.mockReturnValue(deferredLogout.promise);

    const checkAuthPromise = store.dispatch(checkAuth());

    const logoutPromise = store.dispatch(logoutSession());

    deferredRefresh.resolve({
      token: 'old-access-token',
    });

    const user = { id: 15, name: 'Test User' };

    getCurrentUser.mockResolvedValue({ user });

    await checkAuthPromise;

    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);

    deferredLogout.resolve();
    await logoutPromise;

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
        authCheckRequestId: null,
      })
    );
  });

  test('checkAuth восстанавливает сессию через координатор', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    const user = {
      id: 15,
      name: 'Test User',
    };

    coordinator.refreshSession.mockResolvedValue({
      token: 'new-access-token',
    });

    getCurrentUser.mockResolvedValue({ user });

    await store.dispatch(checkAuth()).unwrap();

    expect(coordinator.refreshSession).toHaveBeenCalledTimes(1);

    expect(getCurrentUser).toHaveBeenCalledWith('new-access-token');

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user,
        token: 'new-access-token',
        isAuthenticated: true,
        isCheckingAuth: false,
        status: 'succeeded',
      })
    );
  });

  test('login выполняется через координатор', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    const credentials = {
      email: 'test@example.com',
      password: 'test-password',
    };

    const user = { id: 15, name: 'Test User' };

    coordinator.loginSession.mockResolvedValue({
      user,
      token: 'access-token',
    });

    await store.dispatch(login(credentials)).unwrap();

    expect(coordinator.loginSession).toHaveBeenCalledWith(credentials);

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user,
        token: 'access-token',
        isAuthenticated: true,
        status: 'succeeded',
      })
    );
  });

  test('register выполняется через координатор', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test-password',
    };

    const user = { id: 15, name: 'Test User' };

    coordinator.registerSession.mockResolvedValue({
      user,
      token: 'access-token',
    });

    await store.dispatch(register(formData)).unwrap();

    expect(coordinator.registerSession).toHaveBeenCalledWith(formData);

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user,
        token: 'access-token',
        isAuthenticated: true,
        status: 'succeeded',
      })
    );
  });

  test('logoutSession очищает локальную авторизацию при SESSION_CHANGED', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    const user = {
      id: 15,
      name: 'Test User',
    };

    coordinator.refreshSession.mockResolvedValue({
      token: 'old-access-token',
    });

    getCurrentUser.mockResolvedValue({ user });

    await store.dispatch(checkAuth()).unwrap();

    expect(store.getState().auth.isAuthenticated).toBe(true);

    coordinator.endSession.mockRejectedValue({
      response: {
        status: 409,
        data: {
          code: 'SESSION_CHANGED',
          message: 'Текущая сессия изменилась',
        },
      },
    });

    const result = await store.dispatch(logoutSession()).unwrap();

    expect(result).toEqual({
      sessionChanged: true,
    });

    expect(coordinator.endSession).toHaveBeenCalledTimes(1);

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,
      })
    );
  });

  test('устаревший login не восстанавливает авторизацию после logout', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    const deferredLogin = createDeferred();

    coordinator.loginSession.mockReturnValue(deferredLogin.promise);

    const loginPromise = store.dispatch(
      login({
        email: 'test@example.com',
        password: 'test-password',
      })
    );

    store.dispatch(logout());

    deferredLogin.resolve({
      user: { id: 15, name: 'Test User' },
      token: 'old-access-token',
    });

    await loginPromise;

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
      })
    );
  });

  test('устаревший register не восстанавливает авторизацию после logout', async () => {
    const coordinator = createTestCoordinator();
    const store = createTestStore(coordinator);

    const deferredRegister = createDeferred();

    coordinator.registerSession.mockReturnValue(deferredRegister.promise);

    const registerPromise = store.dispatch(
      register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'test-password',
      })
    );

    store.dispatch(logout());

    deferredRegister.resolve({
      user: { id: 15, name: 'Test User' },
      token: 'old-access-token',
    });

    await registerPromise;

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
        authMutationRequestId: null,
      })
    );
  });
});
