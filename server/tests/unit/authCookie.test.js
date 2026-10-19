const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  setRefreshCookie,
  clearRefreshCookie,
} = require('../../src/utils/authCookie');

const {
  REFRESH_TOKEN_TTL_MS,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} = require('../../config/authConfig');

const createMockResponse = () => {
  const calls = {
    cookie: [],
    clearCookie: [],
  };

  return {
    calls,

    res: {
      cookie(...args) {
        calls.cookie.push(args);
      },

      clearCookie(...args) {
        calls.clearCookie.push(args);
      },
    },
  };
};

test('setRefreshCookie устанавливает безопасную refresh cookie', () => {
  const { res, calls } = createMockResponse();
  const refreshToken = 'test-refresh-token';

  setRefreshCookie(res, refreshToken);

  assert.equal(calls.cookie.length, 1);

  const [name, value, options] = calls.cookie[0];

  assert.equal(name, REFRESH_COOKIE_NAME);
  assert.equal(value, refreshToken);

  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, 'lax');
  assert.equal(options.path, REFRESH_COOKIE_PATH);
  assert.equal(options.maxAge, REFRESH_TOKEN_TTL_MS);

  assert.equal(options.secure, process.env.NODE_ENV === 'production');
});

test('setRefreshCookie поддерживает оставшийся срок сессии', () => {
  const { res, calls } = createMockResponse();

  const remainingMs = 60 * 60 * 1000;

  setRefreshCookie(res, 'test-refresh-token', remainingMs);

  const [, , options] = calls.cookie[0];

  assert.equal(options.maxAge, remainingMs);
});

test('clearRefreshCookie удаляет cookie с правильными параметрами', () => {
  const { res, calls } = createMockResponse();

  clearRefreshCookie(res);

  assert.equal(calls.clearCookie.length, 1);

  const [name, options] = calls.clearCookie[0];

  assert.equal(name, REFRESH_COOKIE_NAME);
  assert.equal(options.path, REFRESH_COOKIE_PATH);
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, 'lax');

  assert.equal(options.secure, process.env.NODE_ENV === 'production');
});
