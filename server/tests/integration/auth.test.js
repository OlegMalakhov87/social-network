const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const { sequelize, User } = require('../../db/models');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');

const TEST_DATABASE = 'socialnet_test';

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== TEST_DATABASE
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

let server;
let baseUrl;
const createTestEmail = () =>
  `test-${randomUUID().replaceAll('-', '')}@example.com`;

before(async () => {
  server = app.listen(0);

  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

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

    // Конфиденциальные поля не должны попадать в ответ.
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

    // Конфиденциальные поля отсутствуют в ответе.
    assert.equal(Object.hasOwn(body.user, 'passwordHash'), false);
    assert.equal(Object.hasOwn(body.user, 'isSystem'), false);

    // Проверяем фактическое сохранение пользователя в БД.
    createdUser = await User.findOne({ where: { email } });

    assert.ok(createdUser);
    assert.equal(createdUser.id, body.user.id);

    // Пароль не должен храниться в открытом виде.
    assert.notEqual(createdUser.passwordHash, password);
    assert.equal(
      await bcrypt.compare(password, createdUser.passwordHash),
      true
    );

    // JWT должен содержать ID зарегистрированного пользователя.
    const decoded = jwt.verify(body.token, process.env.JWT_SECRET);

    assert.equal(decoded.id, createdUser.id);
  } finally {
    // Ищем запись повторно, чтобы удалить её даже
    // при ошибке проверки до присваивания createdUser.
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
    // Первая регистрация
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

    // Повторная регистрация с тем же email
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

    // Проверяем, что в БД остался только один пользователь.
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

      // Некорректный запрос не должен создавать пользователя.
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
