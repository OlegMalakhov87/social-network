const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const jwt = require('jsonwebtoken');

const { sequelize, User, RefreshSession } = require('../../db/models');

const { authMiddleware } = require('../../src/middleware/auth/authMiddleware');

// Запрещает запуск в рабочей базе.
if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

after(async () => {
  await sequelize.close();
});

/**
 * Выполняет middleware и возвращает ошибку,
 * переданную в next(), либо null при успехе.
 */
const checkAccess = (token) =>
  new Promise((resolve, reject) => {
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    Promise.resolve(
      authMiddleware(req, {}, (error) => {
        resolve(error || null);
      })
    ).catch(reject);
  });

/**
 * Создаёт access JWT с указанными claims.
 */
const createAccessToken = (id, sid) =>
  jwt.sign({ id, sid }, process.env.JWT_SECRET, { expiresIn: '15m' });

/**
 * Создаёт тестовую refresh-сессию.
 */
const createSession = (userId, expiresAt, transaction) =>
  RefreshSession.create(
    {
      userId,
      tokenHash: createHash('sha256').update(randomUUID()).digest('hex'),
      expiresAt,
    },
    { transaction }
  );

test('активная серверная сессия разрешает доступ', async () => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.create(
      {
        name: 'Auth Middleware Test',
        email: `auth-${randomUUID()}@example.com`,
        passwordHash: '$2b$10$' + 'a'.repeat(53),
        gender: 'male',
      },
      { transaction }
    );

    const session = await createSession(
      user.id,
      new Date(Date.now() + 86_400_000),
      transaction
    );

    await transaction.commit();

    try {
      const token = createAccessToken(user.id, session.id);

      const result = await checkAccess(token);

      assert.equal(result, null);
    } finally {
      await RefreshSession.destroy({
        where: { id: session.id },
      });

      await User.destroy({
        where: { id: user.id },
      });
    }
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
});
