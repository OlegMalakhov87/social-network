const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, RefreshSession } = require('../../db/models');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

const createTestEmail = () =>
  `test-${randomUUID().replaceAll('-', '')}@example.com`;

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  try {
    if (server) {
      await new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      );
    }
  } finally {
    redis.disconnect();
    await sequelize.close();
  }
});

test('changePassword отзывает все сессии, кроме текущей', async () => {
  // 1. Создаем пользователя
  const user = await User.create({
    name: `test-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('old-password', 4),
  });

  // 2. Создаем 3 сессии (имитация 3-х устройств)
  const session1 = await refreshSessionService.create(user.id);
  const session2 = await refreshSessionService.create(user.id);
  const session3 = await refreshSessionService.create(user.id);

  // 3. Делаем токен для ПЕРВОЙ сессии
  const token1 = jwt.sign(
    { id: user.id, sid: session1.sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  try {
    // 4. Меняем пароль с первого устройства
    const response = await fetch(`${baseUrl}/api/profile/change-password`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      }),
    });

    assert.equal(response.status, 200);

    // 5. Проверяем БД: первая сессия жива, вторая и третья удалены
    const s1 = await RefreshSession.findByPk(session1.sessionId);
    const s2 = await RefreshSession.findByPk(session2.sessionId);
    const s3 = await RefreshSession.findByPk(session3.sessionId);

    assert.ok(s1, 'Текущая сессия должна остаться');
    assert.equal(s2, null, 'Вторая сессия должна быть удалена');
    assert.equal(s3, null, 'Третья сессия должна быть удалена');

    // 6. Проверяем, что старая сессия теперь не может ходить в API
    const token2 = jwt.sign(
      { id: user.id, sid: session2.sessionId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token2}` },
    });

    // Middleware должен отбить запрос (сессия-то удалена)
    assert.equal(meResponse.status, 401);
    const meBody = await meResponse.json();
    assert.equal(meBody.code, 'SESSION_REVOKED');
  } finally {
    await user.destroy();
  }
});

test('PATCH /api/profile/change-password → 400 для пароля > 72 байт', async () => {
  const user = await User.create({
    name: `pw-test-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('old-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  try {
    const response = await fetch(`${baseUrl}/api/profile/change-password`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'old-password',
        newPassword: 'a'.repeat(72) + 'x', // 73 байта
      }),
    });

    assert.equal(response.status, 400);
  } finally {
    await user.destroy();
  }
});

test('PATCH /api/profile/change-password → 200 для пароля ровно 72 байта', async () => {
  const user = await User.create({
    name: `pw-test-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('old-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  try {
    const response = await fetch(`${baseUrl}/api/profile/change-password`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: 'old-password',
        newPassword: 'a'.repeat(72), // ровно 72 байта — валидно
      }),
    });

    assert.equal(response.status, 200);
  } finally {
    await user.destroy();
  }
});
