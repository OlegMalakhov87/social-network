import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../entities/auth/model/authSlice';
import {
  checkAuth,
  login,
  register,
} from '../../entities/auth/model/authThunks';
import { createAuthSessionHandlers } from './authSessionHandlers';

const SESSION_A = '11111111-1111-4111-8111-111111111111';
const SESSION_B = '22222222-2222-4222-8222-222222222222';

// Создаём тестовый JWT.
// Подпись фиктивная: здесь мы только декодируем claims,
// а не проверяем криптографическую подпись.
const createTestToken = (userId, sessionId) => {
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  ).toString('base64url');

  const payload = Buffer.from(
    JSON.stringify({
      id: userId,
      sid: sessionId,
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  return `${header}.${payload}.signature`;
};

const createAuthenticatedStore = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  const requestId = 'test-login-request';
  const credentials = {
    email: 'test@example.com',
    password: 'test-password',
  };

  store.dispatch(login.pending(requestId, credentials));

  store.dispatch(
    login.fulfilled(
      {
        user: {
          id: 15,
          name: 'Test User',
        },
        token: createTestToken(15, SESSION_A),
      },
      requestId,
      credentials
    )
  );

  return store;
};

describe('authSessionHandlers', () => {
  test('SESSION_CHANGED с тем же sid сохраняет авторизацию', () => {
    const store = createAuthenticatedStore();
    const { onSessionChanged } = createAuthSessionHandlers(store);

    onSessionChanged({
      userId: 15,
      sessionId: SESSION_A,
    });

    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user.id).toBe(15);
  });

  test('SESSION_CHANGED с другим sid сбрасывает авторизацию', () => {
    const store = createAuthenticatedStore();
    const { onSessionChanged } = createAuthSessionHandlers(store);

    onSessionChanged({
      userId: 15,
      sessionId: SESSION_B,
    });

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
      })
    );
  });

  test('SESSION_LOGOUT с текущим sid сбрасывает авторизацию', () => {
    const store = createAuthenticatedStore();
    const { onSessionLogout } = createAuthSessionHandlers(store);

    onSessionLogout({
      userId: 15,
      sessionId: SESSION_A,
    });

    expect(store.getState().auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
      })
    );
  });

  test('SESSION_LOGOUT с чужим sid не сбрасывает авторизацию', () => {
    const store = createAuthenticatedStore();
    const { onSessionLogout } = createAuthSessionHandlers(store);

    onSessionLogout({
      userId: 15,
      sessionId: SESSION_B,
    });

    expect(store.getState().auth.isAuthenticated).toBe(true);
    expect(store.getState().auth.user.id).toBe(15);
  });

  test('SESSION_CHANGED отменяет результат незавершённого checkAuth', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
    });

    const requestId = 'pending-auth-check';

    // Начинается восстановление авторизации.
    store.dispatch(checkAuth.pending(requestId, undefined));

    expect(store.getState().auth.authCheckRequestId).toBe(requestId);

    // Другая вкладка создаёт новую сессию.
    const { onSessionChanged } = createAuthSessionHandlers(store);

    onSessionChanged({
      userId: 15,
      sessionId: SESSION_B,
    });

    // Старый запрос завершился уже после смены сессии.
    store.dispatch(
      checkAuth.fulfilled(
        {
          user: { id: 15, name: 'Old User' },
          token: createTestToken(15, SESSION_A),
        },
        requestId,
        undefined
      )
    );

    const auth = store.getState().auth;

    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.authCheckRequestId).toBeNull();
  });

  test('SESSION_CHANGED отменяет результат незавершённого login', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
    });

    const requestId = 'pending-login';

    const credentials = {
      email: 'test@example.com',
      password: 'test-password',
    };

    // Login ещё выполняется.
    store.dispatch(login.pending(requestId, credentials));

    expect(store.getState().auth.authMutationRequestId).toBe(requestId);

    // Из другой вкладки приходит SESSION_CHANGED.
    const { onSessionChanged } = createAuthSessionHandlers(store);

    onSessionChanged({
      userId: 20,
      sessionId: SESSION_B,
    });

    // Поздний ответ от старого login.
    store.dispatch(
      login.fulfilled(
        {
          user: { id: 15, name: 'Old User' },
          token: createTestToken(15, SESSION_A),
        },
        requestId,
        credentials
      )
    );

    const auth = store.getState().auth;

    expect(auth.user).toBeNull();
    expect(auth.token).toBeNull();
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.authMutationRequestId).toBeNull();
  });

  test('SESSION_CHANGED отменяет результат незавершённого register', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
    });

    const requestId = 'pending-register';

    const formData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test-password',
    };

    // Регистрация началась.
    store.dispatch(register.pending(requestId, formData));

    expect(store.getState().auth.authMutationRequestId).toBe(requestId);

    // Другая вкладка создала новую сессию.
    const { onSessionChanged } = createAuthSessionHandlers(store);

    onSessionChanged({
      userId: 20,
      sessionId: SESSION_B,
    });

    // Старый запрос регистрации завершился позже.
    store.dispatch(
      register.fulfilled(
        {
          user: { id: 15, name: 'Old User' },
          token: createTestToken(15, SESSION_A),
        },
        requestId,
        formData
      )
    );

    const auth = store.getState().auth;

    expect(auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        status: 'idle',
        authMutationRequestId: null,
      })
    );
  });

  test('SESSION_LOGOUT старой сессии не отменяет checkAuth новой сессии', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
    });

    const requestId = 'pending-new-session-check';

    // Начинаем восстановление авторизации.
    store.dispatch(checkAuth.pending(requestId, undefined));

    const { onSessionLogout } = createAuthSessionHandlers(store);

    // Другая вкладка сообщает о выходе
    // из старой сессии AAA.
    onSessionLogout({
      userId: 15,
      sessionId: SESSION_A,
    });

    // Наш checkAuth успешно восстановил
    // другую сессию BBB.
    store.dispatch(
      checkAuth.fulfilled(
        {
          user: { id: 15, name: 'Test User' },
          token: createTestToken(15, SESSION_B),
        },
        requestId,
        undefined
      )
    );

    const auth = store.getState().auth;

    expect(auth.isAuthenticated).toBe(true);
    expect(auth.user.id).toBe(15);
    expect(auth.token).toBe(createTestToken(15, SESSION_B));
  });

  test('SESSION_LOGOUT текущей сессии запрещает её восстановление через checkAuth', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
    });

    const requestId = 'pending-revoked-session-check';

    store.dispatch(checkAuth.pending(requestId, undefined));

    const { onSessionLogout } = createAuthSessionHandlers(store);

    onSessionLogout({
      userId: 15,
      sessionId: SESSION_A,
    });

    store.dispatch(
      checkAuth.fulfilled(
        {
          user: { id: 15, name: 'Old User' },
          token: createTestToken(15, SESSION_A),
        },
        requestId,
        undefined
      )
    );

    const auth = store.getState().auth;

    expect(auth).toEqual(
      expect.objectContaining({
        user: null,
        token: null,
        isAuthenticated: false,
        isCheckingAuth: false,
        authCheckRequestId: null,
        pendingSessionLogouts: [],
      })
    );
  });
});
