const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');

const {
  sequelize,
  User,
  RefreshSession,
  UsedRefreshToken,
} = require('../../db/models');

const authSessionCleanupService = require('../../src/services/authSessionCleanupService');

// Защита от запуска на рабочей базе.
if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

after(async () => {
  await sequelize.close();
});

const hashToken = (value) => createHash('sha256').update(value).digest('hex');

test('очистка удаляет истёкшие сессии и их историю, сохраняя активные', async () => {
  const transaction = await sequelize.transaction();

  try {
    const user = await User.create(
      {
        name: 'Cleanup Test User',
        email: `test-${randomUUID().replaceAll('-', '')}@example.com`,
        passwordHash: '$2b$10$' + 'a'.repeat(53),
        gender: 'male',
      },
      { transaction }
    );

    // Истёкшая refresh-сессия.
    const expiredSession = await RefreshSession.create(
      {
        userId: user.id,
        tokenHash: hashToken(randomUUID()),
        expiresAt: new Date(Date.now() - 60_000),
      },
      { transaction }
    );

    // Действующая refresh-сессия.
    const activeSession = await RefreshSession.create(
      {
        userId: user.id,
        tokenHash: hashToken(randomUUID()),
        expiresAt: new Date(Date.now() + 86_400_000),
      },
      { transaction }
    );

    // История истёкшей сессии.
    const expiredUsedToken = await UsedRefreshToken.create(
      {
        sessionId: expiredSession.id,
        tokenHash: hashToken(randomUUID()),
      },
      { transaction }
    );

    // История активной сессии.
    const activeUsedToken = await UsedRefreshToken.create(
      {
        sessionId: activeSession.id,
        tokenHash: hashToken(randomUUID()),
      },
      { transaction }
    );

    await authSessionCleanupService.cleanupExpired({
      transaction,
    });

    // Истёкшая сессия удалена.
    assert.equal(
      await RefreshSession.findByPk(expiredSession.id, { transaction }),
      null
    );

    // Её история удалена каскадно.
    assert.equal(
      await UsedRefreshToken.findByPk(expiredUsedToken.id, { transaction }),
      null
    );

    // Действующая сессия сохранена.
    assert.ok(await RefreshSession.findByPk(activeSession.id, { transaction }));

    // Её история тоже сохранена.
    assert.ok(
      await UsedRefreshToken.findByPk(activeUsedToken.id, { transaction })
    );
  } finally {
    await transaction.rollback();
  }
});
