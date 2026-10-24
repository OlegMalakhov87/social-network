import {
  createAuthRefreshChannel,
  withAuthRefreshLock,
} from '../../../shared/lib';
import { createAuthRefreshCoordinator } from './authRefreshCoordinator';
import { AUTH_MESSAGE_TYPES } from './authRefreshMessages';

/**
 * Мокирует createAuthRefreshChannel.
 */
jest.mock('../../../shared/lib', () => ({
  createAuthRefreshChannel: jest.fn(),
  withAuthRefreshLock: jest.fn(),
}));

/**
 * Сохраняет исходное значение свойства crypto.
 */
const originalCryptoDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'crypto'
);

/**
 * Создаёт объект с promise, resolve и reject.
 * @returns {Object}
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
 * Тестирует координатор обмена сообщениями авторизации.
 */
describe('authRefreshCoordinator', () => {
  let channel;

  beforeEach(() => {
    Object.defineProperty(window, 'crypto', {
      configurable: true,
      value: {
        randomUUID: jest.fn(() => 'test-tab-id'),
      },
    });

    channel = {
      publish: jest.fn(),
      subscribe: jest.fn((callback) => {
        return jest.fn();
      }),
      close: jest.fn(),
    };

    createAuthRefreshChannel.mockReturnValue(channel);
    withAuthRefreshLock.mockImplementation((operation) => operation());
  });

  /**
   * Очищает моки после каждого теста.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Восстанавливает исходное значение свойства crypto.
   */
  afterAll(() => {
    if (originalCryptoDescriptor) {
      Object.defineProperty(window, 'crypto', originalCryptoDescriptor);
    } else {
      delete window.crypto;
    }
  });

  /**
   * Создаёт тестовый токен.
   * @param {Object} options - опции для создания токена
   * @param {number} options.id - идентификатор пользователя
   * @param {string} options.sid - идентификатор сессии
   * @param {number} options.exp - срок действия токена
   * @returns {string} - тестовый токен
   */
  const createTestToken = ({
    id = 15,
    sid = 'session-123',
    exp = Math.floor(Date.now() / 1000) + 3600,
  } = {}) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

    const payload = btoa(JSON.stringify({ id, sid, exp }));

    return `${header}.${payload}.test-signature`;
  };

  test('refreshSession выполняет refresh через Web Lock', async () => {
    const refreshAuth = jest.fn().mockResolvedValue({
      token: 'new-access-token',
    });

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth,
    });

    const result = await coordinator.refreshSession();

    expect(withAuthRefreshLock).toHaveBeenCalledTimes(1);
    expect(withAuthRefreshLock).toHaveBeenCalledWith(expect.any(Function));

    expect(refreshAuth).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      token: 'new-access-token',
    });

    coordinator.dispose();
  });

  test('refreshSession передаёт ошибку refresh', async () => {
    const error = new Error('Refresh failed');

    const refreshAuth = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({
        token: 'new-access-token',
      });

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth,
    });

    await expect(coordinator.refreshSession()).rejects.toThrow(
      'Refresh failed'
    );

    await expect(coordinator.refreshSession()).resolves.toEqual({
      token: 'new-access-token',
    });

    expect(refreshAuth).toHaveBeenCalledTimes(2);

    coordinator.dispose();
  });

  test('refreshSession не запускается после dispose', async () => {
    const refreshAuth = jest.fn();

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth,
    });

    coordinator.dispose();

    await expect(coordinator.refreshSession()).rejects.toThrow(
      'Координатор авторизации завершил работу'
    );

    expect(withAuthRefreshLock).not.toHaveBeenCalled();
    expect(refreshAuth).not.toHaveBeenCalled();
  });

  test('две конкурентные операции выполняются последовательно', async () => {
    const firstOperation = createDeferred();
    const firstStarted = createDeferred();
    const secondStarted = createDeferred();

    let lockQueue = Promise.resolve();

    withAuthRefreshLock.mockImplementation((operation) => {
      const result = lockQueue.then(operation);

      lockQueue = result.then(
        () => undefined,
        () => undefined
      );

      return result;
    });

    const firstRefresh = jest.fn(() => {
      firstStarted.resolve();
      return firstOperation.promise;
    });

    const secondRefresh = jest.fn(() => {
      secondStarted.resolve();
      return Promise.resolve({
        token: 'second-access-token',
      });
    });

    const firstCoordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth: firstRefresh,
    });

    const secondCoordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth: secondRefresh,
    });

    try {
      const firstPromise = firstCoordinator.refreshSession();
      const secondPromise = secondCoordinator.refreshSession();

      await firstStarted.promise;

      expect(firstRefresh).toHaveBeenCalledTimes(1);

      expect(secondRefresh).not.toHaveBeenCalled();

      firstOperation.resolve({
        token: 'first-access-token',
      });

      const firstResult = await firstPromise;

      await secondStarted.promise;

      const secondResult = await secondPromise;

      expect(firstResult.token).toBe('first-access-token');
      expect(secondResult.token).toBe('second-access-token');

      expect(firstRefresh).toHaveBeenCalledTimes(1);
      expect(secondRefresh).toHaveBeenCalledTimes(1);
    } finally {
      firstOperation.resolve();

      firstCoordinator.dispose();
      secondCoordinator.dispose();
    }
  });

  test('endSession выполняет logout через Web Lock', async () => {
    const logoutUser = jest.fn().mockResolvedValue(undefined);

    const coordinator = createAuthRefreshCoordinator({
      getToken: () =>
        createTestToken({
          id: 15,
          sid: 'session-123',
          exp: Math.floor(Date.now() / 1000) + 10,
        }),
      refreshAuth: jest.fn(),
      logoutUser,
    });

    await coordinator.endSession();

    expect(withAuthRefreshLock).toHaveBeenCalledTimes(1);
    expect(withAuthRefreshLock).toHaveBeenCalledWith(expect.any(Function));

    expect(logoutUser).toHaveBeenCalledTimes(1);
    expect(logoutUser).toHaveBeenCalledWith('session-123');

    coordinator.dispose();
  });

  test('logout ожидает завершения refresh', async () => {
    const refreshStarted = createDeferred();
    const refreshCompleted = createDeferred();

    let lockQueue = Promise.resolve();

    withAuthRefreshLock.mockImplementation((operation) => {
      const result = lockQueue.then(operation);

      lockQueue = result.then(
        () => undefined,
        () => undefined
      );

      return result;
    });

    const refreshAuth = jest.fn(() => {
      refreshStarted.resolve();
      return refreshCompleted.promise;
    });

    const logoutUser = jest.fn().mockResolvedValue(undefined);

    const coordinator = createAuthRefreshCoordinator({
      getToken: () =>
        createTestToken({
          id: 15,
          sid: 'session-123',
          exp: Math.floor(Date.now() / 1000) + 10,
        }),
      refreshAuth,
      logoutUser,
    });

    try {
      const refreshPromise = coordinator.refreshSession();
      const logoutPromise = coordinator.endSession();

      await refreshStarted.promise;

      expect(refreshAuth).toHaveBeenCalledTimes(1);

      expect(logoutUser).not.toHaveBeenCalled();

      refreshCompleted.resolve({
        token: 'new-access-token',
      });

      await refreshPromise;
      await logoutPromise;

      expect(logoutUser).toHaveBeenCalledTimes(1);
      expect(logoutUser).toHaveBeenCalledWith('session-123');

      expect(refreshAuth.mock.invocationCallOrder[0]).toBeLessThan(
        logoutUser.mock.invocationCallOrder[0]
      );
    } finally {
      refreshCompleted.resolve();
      coordinator.dispose();
    }
  });

  test('endSession не запускается после dispose', async () => {
    const logoutUser = jest.fn();

    const coordinator = createAuthRefreshCoordinator({
      getToken: () =>
        createTestToken({
          id: 15,
          sid: 'session-123',
          exp: Math.floor(Date.now() / 1000) + 10,
        }),
      refreshAuth: jest.fn(),
      logoutUser,
    });

    coordinator.dispose();

    await expect(coordinator.endSession()).rejects.toThrow(
      'Координатор авторизации завершил работу'
    );

    expect(logoutUser).not.toHaveBeenCalled();
    expect(withAuthRefreshLock).not.toHaveBeenCalled();
  });

  test('endSession уведомляет вкладки после успешного logout', async () => {
    const logoutUser = jest.fn().mockResolvedValue(undefined);

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => createTestToken({ id: 15, sid: 'session-123' }),
      refreshAuth: jest.fn(),
      logoutUser,
    });

    await coordinator.endSession();

    expect(logoutUser).toHaveBeenCalledTimes(1);
    expect(logoutUser).toHaveBeenCalledWith('session-123');

    expect(channel.publish).toHaveBeenCalledWith({
      type: AUTH_MESSAGE_TYPES.SESSION_LOGOUT,
      senderId: 'test-tab-id',
      userId: 15,
      sessionId: 'session-123',
    });

    coordinator.dispose();
  });

  test('endSession не уведомляет вкладки при ошибке logout', async () => {
    const logoutUser = jest.fn().mockRejectedValue(new Error('Logout failed'));

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => createTestToken({ id: 15, sid: 'session-123' }),
      refreshAuth: jest.fn(),
      logoutUser,
    });

    await expect(coordinator.endSession()).rejects.toThrow('Logout failed');

    expect(channel.publish).not.toHaveBeenCalled();

    coordinator.dispose();
  });

  test('SESSION_LOGOUT вызывает onSessionLogout', () => {
    const onSessionLogout = jest.fn();

    const coordinator = createAuthRefreshCoordinator({
      getToken: () =>
        createTestToken({
          id: 15,
          sid: 'session-123',
          exp: Math.floor(Date.now() / 1000) + 10,
        }),
      refreshAuth: jest.fn(),
      logoutUser: jest.fn(),
      onSessionLogout,
    });

    const calls = channel.subscribe.mock.calls;
    const handler = calls[calls.length - 1][0];

    expect(handler).toEqual(expect.any(Function));

    handler({
      type: AUTH_MESSAGE_TYPES.SESSION_LOGOUT,
      senderId: 'another-tab',
      userId: 15,
      sessionId: 'session-123',
    });

    expect(onSessionLogout).toHaveBeenCalledTimes(1);

    expect(onSessionLogout).toHaveBeenCalledWith({
      userId: 15,
      sessionId: 'session-123',
    });

    coordinator.dispose();
  });

  test('loginSession публикует SESSION_CHANGED', async () => {
    const user = { id: 15, name: 'Test User' };

    const result = {
      user,
      token: createTestToken({ id: 15, sid: 'session-123' }),
    };

    const loginUser = jest.fn().mockResolvedValue(result);

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth: jest.fn(),
      logoutUser: jest.fn(),
      loginUser,
    });

    const credentials = {
      email: 'test@example.com',
      password: 'test-password',
    };

    const response = await coordinator.loginSession(credentials);

    expect(loginUser).toHaveBeenCalledWith(credentials);

    expect(response).toEqual(result);

    expect(channel.publish).toHaveBeenCalledWith({
      type: AUTH_MESSAGE_TYPES.SESSION_CHANGED,
      senderId: 'test-tab-id',
      userId: 15,
      sessionId: 'session-123',
    });

    coordinator.dispose();
  });

  test('registerSession публикует SESSION_CHANGED', async () => {
    const user = { id: 15, name: 'Test User' };

    const result = {
      user,
      token: createTestToken({ id: 15, sid: 'session-123' }),
    };

    const registerUser = jest.fn().mockResolvedValue(result);

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth: jest.fn(),
      logoutUser: jest.fn(),
      registerUser,
    });

    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test-password',
    };

    const response = await coordinator.registerSession(formData);

    expect(registerUser).toHaveBeenCalledWith(formData);

    expect(response).toEqual(result);

    expect(channel.publish).toHaveBeenCalledWith({
      type: AUTH_MESSAGE_TYPES.SESSION_CHANGED,
      senderId: 'test-tab-id',
      userId: 15,
      sessionId: 'session-123',
    });

    coordinator.dispose();
  });

  test('loginSession не публикует сообщение при ошибке login', async () => {
    const loginUser = jest
      .fn()
      .mockRejectedValue(new Error('Invalid credentials'));

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth: jest.fn(),
      logoutUser: jest.fn(),
      loginUser,
    });

    await expect(
      coordinator.loginSession({
        email: 'test@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid credentials');

    expect(channel.publish).not.toHaveBeenCalled();

    coordinator.dispose();
  });

  test('SESSION_CHANGED вызывает onSessionChanged', () => {
    const onSessionChanged = jest.fn();

    const subscriptionsBefore = channel.subscribe.mock.calls.length;

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth: jest.fn(),
      logoutUser: jest.fn(),
      onSessionChanged,
    });

    try {
      expect(channel.subscribe.mock.calls.length).toBe(subscriptionsBefore + 1);

      const handler = channel.subscribe.mock.calls[subscriptionsBefore][0];

      expect(handler).toEqual(expect.any(Function));

      expect(AUTH_MESSAGE_TYPES.SESSION_CHANGED).toBe('SESSION_CHANGED');

      handler({
        type: AUTH_MESSAGE_TYPES.SESSION_CHANGED,
        senderId: 'another-tab',
        userId: 15,
        sessionId: 'new-session-id',
      });

      expect(onSessionChanged).toHaveBeenCalledTimes(1);

      expect(onSessionChanged).toHaveBeenCalledWith({
        userId: 15,
        sessionId: 'new-session-id',
      });
    } finally {
      coordinator.dispose();
    }
  });

  test('ошибка публикации не отменяет успешный login', async () => {
    const result = {
      user: { id: 15, name: 'Test User' },
      token: createTestToken({ id: 15, sid: 'session-123' }),
    };

    const loginUser = jest.fn().mockResolvedValue(result);

    channel.publish.mockImplementation(() => {
      throw new Error('BroadcastChannel failed');
    });

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => null,
      refreshAuth: jest.fn(),
      logoutUser: jest.fn(),
      loginUser,
    });

    try {
      await expect(
        coordinator.loginSession({
          email: 'test@example.com',
          password: 'test-password',
        })
      ).resolves.toEqual(result);

      expect(warnSpy).toHaveBeenCalled();
    } finally {
      coordinator.dispose();
      warnSpy.mockRestore();
    }
  });

  test('notifySessionRevoked уведомляет вкладки о текущей сессии', () => {
    const token = createTestToken({
      id: 15,
      sid: 'session-123',
    });

    const coordinator = createAuthRefreshCoordinator({
      getToken: () => token,
      refreshAuth: jest.fn(),
    });

    coordinator.notifySessionRevoked(token);

    expect(channel.publish).toHaveBeenCalledWith({
      type: AUTH_MESSAGE_TYPES.SESSION_LOGOUT,
      senderId: 'test-tab-id',
      userId: 15,
      sessionId: 'session-123',
    });

    coordinator.dispose();
  });
});
