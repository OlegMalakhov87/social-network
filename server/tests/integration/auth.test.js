const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID, createHash } = require('node:crypto');

const { sequelize, User, RefreshSession } = require('../../db/models');

const {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} = require('../../config/authConfig');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');

/**
 * Проверяет, что тесты запускаются в правильном окружении.
 * @returns {void}
 */
if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

/**
 * Создает тестовый email.
 * @returns {string}
 */
const createTestEmail = () =>
  `test-${randomUUID().replaceAll('-', '')}@example.com`;

/**
 * Проверяет refresh cookie.
 * @param {Response} response
 * @param {number} userId
 * @returns {Promise<void>}
 */
const assertRefreshCookie = async (response, userId) => {
  const setCookie = response.headers.get('set-cookie');

  assert.ok(setCookie, 'Ожидался заголовок Set-Cookie');

  const cookieParts = setCookie.split(';');
  const [name, refreshToken] = cookieParts[0].split('=');

  assert.equal(name, REFRESH_COOKIE_NAME);
  assert.match(refreshToken, /^[a-f0-9]{64}$/);

  const attributes = cookieParts
    .slice(1)
    .map((part) => part.trim().toLowerCase());

  assert.ok(attributes.includes('httponly'));
  assert.ok(attributes.includes('samesite=lax'));
  assert.ok(attributes.includes(`path=${REFRESH_COOKIE_PATH}`.toLowerCase()));

  assert.ok(attributes.some((attribute) => attribute.startsWith('max-age=')));

  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

  const session = await RefreshSession.findOne({
    where: { tokenHash },
  });

  assert.ok(session, 'Refresh-сессия должна существовать');
  assert.equal(session.userId, userId);
  assert.ok(session.expiresAt > new Date());

  return session;
};

let server;
let baseUrl;

/**
 * Запускает сервер.
 * @returns {Promise<void>}
 */
before(async () => {
  server = app.listen(0);

  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

/**
 * Останавливает сервер.
 * @returns {Promise<void>}
 */
after(async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) return reject(error);
          resolve();
        });
      });
    }
  } finally {
    redis.disconnect();
    await sequelize.close();
  }
});

test('GET /api/auth/me возвращает 401 без токена', async () => {
  const url = `${baseUrl}/api/auth/me`;

  const response = await fetch(url);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, 'INVALID_TOKEN');
  assert.equal(body.error, 'Токен не предоставлен или имеет неверный формат');
});

test('GET /api/auth/me отклоняет недействительный JWT', async () => {
  const url = `${baseUrl}/api/auth/me`;

  const response = await fetch(url, {
    headers: {
      Authorization: 'Bearer invalid-token',
    },
  });

  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, 'INVALID_TOKEN');
  assert.equal(body.error, 'Недействительный токен');
});

test('GET /api/auth/me возвращает текущего пользователя', async () => {
  const uniqueId = randomUUID();

  const user = await User.create({
    name: `auth-test-${uniqueId}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '5m',
    });

    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user.id, user.id);
    assert.equal(body.user.email, user.email);

    assert.equal(Object.hasOwn(body.user, 'passwordHash'), false);
    assert.equal(Object.hasOwn(body.user, 'isSystem'), false);
  } finally {
    await user.destroy();
  }
});

test('GET /api/auth/me возвращает 404, если пользователь не существует', async () => {
  const userId = -1;

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });

  const response = await fetch(`${baseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.code, 'USER_NOT_FOUND');
  assert.equal(body.error, 'Пользователь не найден');
});

test('POST /api/auth/register успешно регистрирует пользователя', async () => {
  const uniqueId = randomUUID();
  const email = createTestEmail();
  const password = 'test-password-123';

  let createdUser;

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email,
        password,
        gender: 'male',
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.user.email, email);
    assert.equal(body.user.name, 'Test User');
    assert.equal(typeof body.token, 'string');

    assert.equal(Object.hasOwn(body.user, 'passwordHash'), false);
    assert.equal(Object.hasOwn(body.user, 'isSystem'), false);

    createdUser = await User.findOne({ where: { email } });

    assert.ok(createdUser);
    assert.equal(createdUser.id, body.user.id);

    assert.notEqual(createdUser.passwordHash, password);
    assert.equal(
      await bcrypt.compare(password, createdUser.passwordHash),
      true
    );

    const decoded = jwt.verify(body.token, process.env.JWT_SECRET);

    assert.equal(decoded.id, createdUser.id);

    assert.equal(Object.hasOwn(body, 'refreshToken'), false);
    assert.equal(Object.hasOwn(body, 'expiresAt'), false);

    await assertRefreshCookie(response, createdUser.id);

    const sessionsCount = await RefreshSession.count({
      where: { userId: createdUser.id },
    });

    assert.equal(sessionsCount, 1);
  } finally {
    const user =
      createdUser ??
      (await User.findOne({
        where: { email },
      }));

    if (user) {
      await user.destroy();
    }
  }
});

test('POST /api/auth/register отклоняет повторную регистрацию с существующим email', async () => {
  const uniqueId = randomUUID();
  const email = createTestEmail();

  let createdUser;

  try {
    const firstResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'First User',
        email,
        password: 'test-password-123',
        gender: 'male',
      }),
    });

    assert.equal(firstResponse.status, 201);

    const secondResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Second User',
        email,
        password: 'another-password-123',
        gender: 'female',
      }),
    });

    const body = await secondResponse.json();

    assert.equal(secondResponse.status, 409);
    assert.equal(body.code, 'USER_EXISTS');
    assert.equal(body.error, 'Email уже используется');

    const usersCount = await User.count({
      where: { email },
    });

    assert.equal(usersCount, 1);
  } finally {
    createdUser = await User.findOne({
      where: { email },
    });

    if (createdUser) {
      await createdUser.destroy();
    }
  }
});

test('POST /api/auth/register обрабатывает одновременную регистрацию с одинаковым email', async () => {
  const email = createTestEmail();

  const userData = {
    name: 'Concurrent User',
    email,
    password: 'password123',
    gender: 'male',
  };

  try {
    const responses = await Promise.all(
      Array.from({ length: 2 }, () =>
        fetch(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        })
      )
    );

    const statuses = responses.map((response) => response.status).sort();

    assert.deepEqual(statuses, [201, 409]);

    const conflictResponse = responses.find(
      (response) => response.status === 409
    );

    const conflictBody = await conflictResponse.json();

    assert.equal(conflictBody.code, 'USER_EXISTS');

    const usersCount = await User.count({
      where: { email },
    });

    assert.equal(usersCount, 1);
  } finally {
    await User.destroy({
      where: { email },
    });
  }
});

test('POST /api/auth/register отклоняет некорректные данные', async (t) => {
  const invalidCases = [
    {
      name: 'пустое имя',
      field: 'name',
      changes: { name: '' },
    },
    {
      name: 'некорректный email',
      field: 'email',
      changes: { email: 'invalid-email' },
    },
    {
      name: 'короткий пароль',
      field: 'password',
      changes: { password: '123' },
    },
    {
      name: 'некорректный пол',
      field: 'gender',
      changes: { gender: 'unknown' },
    },
  ];

  for (const invalidCase of invalidCases) {
    await t.test(invalidCase.name, async () => {
      const uniqueId = randomUUID();
      const email = createTestEmail();

      const requestBody = {
        name: 'Test User',
        email,
        password: 'test-password-123',
        gender: 'male',
        ...invalidCase.changes,
      };

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const body = await response.json();

      assert.equal(response.status, 400);
      assert.equal(body.error, 'Ошибка регистрации');
      assert.ok(Array.isArray(body.details));

      assert.ok(
        body.details.some((detail) => detail.field === invalidCase.field),
        `Ожидалась ошибка поля ${invalidCase.field}`
      );

      const usersCount = await User.count({
        where: { email },
      });

      assert.equal(usersCount, 0);
    });
  }
});

test('POST /api/auth/login успешно авторизует пользователя', async () => {
  const email = createTestEmail();
  const password = 'test-password-123';

  const user = await User.create({
    name: 'Login Test User',
    email,
    passwordHash: await bcrypt.hash(password, 4),
    gender: 'male',
  });

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user.id, user.id);
    assert.equal(body.user.email, email);
    assert.equal(typeof body.token, 'string');

    assert.equal(Object.hasOwn(body.user, 'passwordHash'), false);
    assert.equal(Object.hasOwn(body.user, 'isSystem'), false);

    const decoded = jwt.verify(body.token, process.env.JWT_SECRET);

    assert.equal(decoded.id, user.id);

    assert.equal(Object.hasOwn(body, 'refreshToken'), false);
    assert.equal(Object.hasOwn(body, 'expiresAt'), false);

    await assertRefreshCookie(response, user.id);

    const sessionsCount = await RefreshSession.count({
      where: { userId: user.id },
    });

    assert.equal(sessionsCount, 1);
  } finally {
    await user.destroy();
  }
});

test('POST /api/auth/login отклоняет несуществующий email', async () => {
  const email = createTestEmail();

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: 'test-password-123',
    }),
  });

  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, 'INVALID_CREDENTIALS');
  assert.equal(body.error, 'Неверный email или пароль');
});

test('POST /api/auth/login отклоняет неправильный пароль', async () => {
  const email = createTestEmail();

  const user = await User.create({
    name: 'Login Test User',
    email,
    passwordHash: await bcrypt.hash('correct-password-123', 4),
    gender: 'male',
  });

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: 'wrong-password-123',
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.code, 'INVALID_CREDENTIALS');
    assert.equal(body.error, 'Неверный email или пароль');

    assert.equal(response.headers.get('set-cookie'), null);

    assert.equal(
      await RefreshSession.count({
        where: { userId: user.id },
      }),
      0
    );
  } finally {
    await user.destroy();
  }
});

test('POST /api/auth/login запрещает вход системному пользователю', async () => {
  const email = createTestEmail();

  const user = await User.create({
    name: 'System Test User',
    email,
    passwordHash: await bcrypt.hash('test-password-123', 4),
    gender: 'male',
    isSystem: true,
  });

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: 'test-password-123',
      }),
    });

    const body = await response.json();

    assert.equal(response.status, 403);
    assert.equal(body.code, 'ACCESS_FORBIDDEN');
    assert.equal(body.error, 'Доступ запрещен');
    assert.equal(Object.hasOwn(body, 'token'), false);
  } finally {
    await user.destroy();
  }
});

test('login → refresh → logout → refresh: полный цикл сессии', async () => {
  const email = createTestEmail();
  const password = 'test-password-123';

  const user = await User.create({
    name: 'Session Test User',
    email,
    passwordHash: await bcrypt.hash(password, 4),
    gender: 'male',
  });

  const origin = process.env.CLIENT_URL;

  const getCookie = (response) => {
    const setCookie = response.headers.get('set-cookie');

    assert.ok(setCookie, 'Ожидался Set-Cookie');

    return setCookie.split(';')[0];
  };

  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({ email, password }),
    });

    assert.equal(loginResponse.status, 200);

    const loginBody = await loginResponse.json();

    const loginPayload = jwt.verify(loginBody.token, process.env.JWT_SECRET);

    assert.equal(loginPayload.id, user.id);
    assert.equal(typeof loginPayload.sid, 'string');
    assert.ok(loginPayload.sid.length > 0);

    assert.equal(typeof loginBody.token, 'string');
    assert.equal(Object.hasOwn(loginBody, 'refreshToken'), false);

    const firstCookie = getCookie(loginResponse);

    const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Origin: origin,
        Cookie: firstCookie,
      },
    });

    assert.equal(refreshResponse.status, 200);

    const refreshBody = await refreshResponse.json();

    const refreshPayload = jwt.verify(
      refreshBody.token,
      process.env.JWT_SECRET
    );

    assert.equal(refreshPayload.id, loginPayload.id);
    assert.equal(refreshPayload.sid, loginPayload.sid);

    assert.equal(typeof refreshBody.token, 'string');
    assert.equal(Object.hasOwn(refreshBody, 'refreshToken'), false);

    const secondCookie = getCookie(refreshResponse);

    assert.notEqual(secondCookie, firstCookie);

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        Cookie: secondCookie,
      },
      body: JSON.stringify({ sessionId: refreshPayload.sid }),
    });

    assert.equal(logoutResponse.status, 200);

    const clearedCookie = logoutResponse.headers.get('set-cookie');

    assert.ok(clearedCookie);
    assert.match(clearedCookie, /refreshToken=/);
    assert.match(clearedCookie, /Path=\/api\/auth/i);
    assert.match(clearedCookie, /HttpOnly/i);

    const expiresMatch = clearedCookie.match(/Expires=([^;]+)/i);

    assert.ok(expiresMatch, 'Ожидался атрибут Expires');

    const expiresAt = new Date(expiresMatch[1]);

    assert.ok(
      expiresAt.getTime() <= Date.now(),
      'Cookie должна иметь истёкший срок действия'
    );
    assert.equal(
      await RefreshSession.count({
        where: { userId: user.id },
      }),
      0
    );

    const rejectedRefresh = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Origin: origin,
        Cookie: secondCookie,
      },
    });

    assert.equal(rejectedRefresh.status, 401);
  } finally {
    await user.destroy();
  }
});

test('POST /api/auth/refresh отклоняет недопустимый Origin', async () => {
  const response = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      Origin: 'https://untrusted.example',
    },
  });

  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.code, 'INVALID_ORIGIN');
});

test('повторное использование старой refresh cookie отзывает сессию', async () => {
  const email = createTestEmail();
  const password = 'test-password-123';

  const user = await User.create({
    name: 'Refresh Reuse Test',
    email,
    passwordHash: await bcrypt.hash(password, 4),
    gender: 'male',
  });

  const origin = process.env.CLIENT_URL;

  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({ email, password }),
    });

    assert.equal(loginResponse.status, 200);

    const loginBody = await loginResponse.json();

    const oldCookie = loginResponse.headers.get('set-cookie').split(';')[0];

    const decoded = jwt.verify(loginBody.token, process.env.JWT_SECRET);

    assert.equal(decoded.id, user.id);
    assert.equal(typeof decoded.sid, 'string');
    assert.ok(decoded.sid.length > 0);

    const firstRefresh = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Origin: origin,
        Cookie: oldCookie,
      },
    });

    assert.equal(firstRefresh.status, 200);

    const newCookie = firstRefresh.headers.get('set-cookie').split(';')[0];

    assert.notEqual(oldCookie, newCookie);

    const reusedRefresh = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Origin: origin,
        Cookie: oldCookie,
      },
    });

    assert.equal(reusedRefresh.status, 401);

    const errorBody = await reusedRefresh.json();

    assert.equal(errorBody.code, 'REFRESH_TOKEN_REUSED');

    assert.equal(
      await RefreshSession.count({
        where: { userId: user.id },
      }),
      0
    );

    const rejectedRefresh = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Origin: origin,
        Cookie: newCookie,
      },
    });

    assert.equal(rejectedRefresh.status, 401);
  } finally {
    await user.destroy();
  }
});

test('POST /api/auth/login создаёт отдельную сессию при каждом входе', async () => {
  const email = createTestEmail();
  const password = 'test-password-123';

  const user = await User.create({
    name: 'Login Test User',
    email,
    passwordHash: await bcrypt.hash(password, 4),
    gender: 'male',
  });

  const origin = process.env.CLIENT_URL;

  const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  try {
    const firstResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({ email, password }),
    });

    assert.equal(firstResponse.status, 200);

    const firstBody = await firstResponse.json();

    const firstPayload = jwt.verify(firstBody.token, process.env.JWT_SECRET);

    const secondResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
      },
      body: JSON.stringify({ email, password }),
    });

    assert.equal(secondResponse.status, 200);

    const secondBody = await secondResponse.json();

    const secondPayload = jwt.verify(secondBody.token, process.env.JWT_SECRET);

    assert.equal(firstPayload.id, user.id);
    assert.equal(secondPayload.id, user.id);

    assert.match(firstPayload.sid, UUID_REGEX);
    assert.match(secondPayload.sid, UUID_REGEX);

    assert.notEqual(firstPayload.sid, secondPayload.sid);
  } finally {
    await user.destroy();
  }
});

test('POST /api/auth/refresh отклоняет запрос без Origin', async () => {
  const response = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: 'POST',
  });

  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.code, 'INVALID_ORIGIN');
});

test('POST /api/auth/logout отклоняет некорректный sessionId', async () => {
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.CLIENT_URL,
    },
    body: JSON.stringify({ sessionId: 'invalid-session-id' }),
  });

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.code, 'INVALID_SESSION_ID');
  assert.equal(body.message, 'Некорректный идентификатор сессии');
});

test('POST /api/auth/logout возвращает 409 при несовпадении сессий', async () => {
  const email = createTestEmail();
  const password = 'test-password-123';

  const user = await User.create({
    name: 'Session Conflict User',
    email,
    passwordHash: await bcrypt.hash(password, 4),
    gender: 'male',
  });

  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: process.env.CLIENT_URL,
      },
      body: JSON.stringify({ email, password }),
    });

    assert.equal(loginResponse.status, 200);

    const loginBody = await loginResponse.json();

    const payload = jwt.verify(loginBody.token, process.env.JWT_SECRET);

    const setCookie = loginResponse.headers.get('set-cookie');

    assert.ok(setCookie);

    const refreshCookie = setCookie.split(';')[0];

    const wrongSessionId = randomUUID();

    assert.notEqual(wrongSessionId, payload.sid);

    const response = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: process.env.CLIENT_URL,
        Cookie: refreshCookie,
      },
      body: JSON.stringify({
        sessionId: wrongSessionId,
      }),
    });

    assert.equal(response.status, 409);

    const body = await response.json();

    assert.equal(body.code, 'SESSION_CHANGED');

    const logoutSetCookie = response.headers.get('set-cookie');

    assert.equal(logoutSetCookie, null);

    const sessionInDb = await RefreshSession.findByPk(payload.sid);

    assert.ok(sessionInDb, 'Исходная сессия не должна удаляться');
  } finally {
    await user.destroy();
  }
});
