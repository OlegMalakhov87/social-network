import { configureStore } from '@reduxjs/toolkit';

import { getAccessTokenClaims } from '../lib/accessToken';
import authReducer, { logout, setAccessToken } from './authSlice';
import { login, logoutSession } from './authThunks';

const SESSION_A = '11111111-1111-4111-8111-111111111111';
const SESSION_B = '22222222-2222-4222-8222-222222222222';

/**
 * Создаёт маркер доступа для проверки.
 *
 * @param {number} userId - Идентификатор пользователя
 * @param {string} sessionId - Идентификатор сессии
 * @param {number} [version=1] - Версия маркера
 * @returns {string} Маркер доступа
 */
const createToken = (userId, sessionId, version = 1) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');

  const now = Math.floor(Date.now() / 1000);

  return [
    encode({
      alg: 'HS256',
      typ: 'JWT',
    }),
    encode({
      id: userId,
      sid: sessionId,
      iat: now - 10,
      exp: now + 3600,
      version,
    }),
    'signature',
  ].join('.');
};

/** Создаёт авторизованное состояние Redux для проверки. */
const createAuthenticatedStore = () => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });

  const credentials = {
    email: 'test@example.com',
    password: 'test-password',
  };

  const requestId = 'login-request';

  store.dispatch(login.pending(requestId, credentials));

  store.dispatch(
    login.fulfilled(
      {
        user: { id: 15, name: 'Test User' },
        token: createToken(15, SESSION_A),
      },
      requestId,
      credentials
    )
  );

  return store;
};

describe('authSlice: setAccessToken', () => {
  test('обновляет JWT текущей сессии', () => {
    const store = createAuthenticatedStore();

    const expectedToken = store.getState().auth.token;
    const newToken = createToken(15, SESSION_A, 2);

    expect(getAccessTokenClaims(expectedToken)).toEqual(
      expect.objectContaining({
        id: 15,
        sid: SESSION_A,
      })
    );

    expect(getAccessTokenClaims(newToken)).toEqual(
      expect.objectContaining({
        id: 15,
        sid: SESSION_A,
      })
    );

    store.dispatch(
      setAccessToken({
        token: newToken,
        expectedToken,
      })
    );

    expect(store.getState().auth.token).toBe(newToken);
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  test('не восстанавливает JWT после logout', () => {
    const store = createAuthenticatedStore();

    const expectedToken = store.getState().auth.token;

    store.dispatch(logout());

    expect(getAccessTokenClaims(expectedToken)).toEqual(
      expect.objectContaining({
        id: 15,
        sid: SESSION_A,
      })
    );

    store.dispatch(
      setAccessToken({
        token: createToken(15, SESSION_A, 2),
        expectedToken,
      })
    );

    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  test('не принимает JWT другой сессии', () => {
    const store = createAuthenticatedStore();

    const expectedToken = store.getState().auth.token;

    expect(getAccessTokenClaims(expectedToken)).toEqual(
      expect.objectContaining({
        id: 15,
        sid: SESSION_A,
      })
    );

    store.dispatch(
      setAccessToken({
        token: createToken(15, SESSION_B, 2),
        expectedToken,
      })
    );

    expect(store.getState().auth.token).toBe(expectedToken);
  });

  test('не перезаписывает более новый access token', () => {
    const store = createAuthenticatedStore();

    const originalToken = store.getState().auth.token;
    const updatedToken = createToken(15, SESSION_A, 2);

    expect(getAccessTokenClaims(originalToken)).toEqual(
      expect.objectContaining({
        id: 15,
        sid: SESSION_A,
      })
    );

    expect(getAccessTokenClaims(updatedToken)).toEqual(
      expect.objectContaining({
        id: 15,
        sid: SESSION_A,
      })
    );

    store.dispatch(
      setAccessToken({
        token: updatedToken,
        expectedToken: originalToken,
      })
    );

    store.dispatch(
      setAccessToken({
        token: createToken(15, SESSION_A, 3),
        expectedToken: originalToken,
      })
    );

    expect(store.getState().auth.token).toBe(updatedToken);
  });

  test('не обновляет JWT во время logoutSession.pending', () => {
    const store = createAuthenticatedStore();

    const expectedToken = store.getState().auth.token;

    store.dispatch(logoutSession.pending('logout-request', undefined));

    expect(getAccessTokenClaims(expectedToken)).toEqual(
      expect.objectContaining({
        id: 15,
        sid: SESSION_A,
      })
    );

    store.dispatch(
      setAccessToken({
        token: createToken(15, SESSION_A, 2),
        expectedToken,
      })
    );

    expect(store.getState().auth.token).toBe(expectedToken);
    expect(store.getState().auth.isLoggingOut).toBe(true);
  });
});
