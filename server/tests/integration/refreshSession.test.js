const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, createHash } = require('node:crypto');
const {
  sequelize,
  User,
  RefreshSession,
  UsedRefreshToken,
} = require('../../db/models');
const refreshSessionService = require('../../src/services/refreshSessionService');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

after(async () => {
  await sequelize.close();
});

const createTestUser = async () => {
  return User.create({
    name: 'Refresh Test User',
    email: `test-${randomUUID().replaceAll('-', '')}@example.com`,
    passwordHash: '$2b$10$' + 'a'.repeat(53),
    gender: 'male',
  });
};

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

test('Удаление пользователя каскадно удаляет его refresh-сессии', async () => {
  const user = await createTestUser();

  try {
    const session = await RefreshSession.create({
      userId: user.id,
      tokenHash: hashToken(randomUUID()),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    assert.equal(
      await RefreshSession.count({
        where: { id: session.id },
      }),
      1
    );

    await user.destroy();

    const sessionAfterDeletion = await RefreshSession.findByPk(session.id);

    assert.equal(sessionAfterDeletion, null);
  } finally {
    await RefreshSession.destroy({ where: { userId: user.id } });
    await User.destroy({ where: { id: user.id } });
  }
});

test('create создаёт refresh-сессию и сохраняет только хеш токена', async () => {
  const user = await createTestUser();

  try {
    const beforeCreation = Date.now();

    const { refreshToken } = await refreshSessionService.create(user.id);

    const afterCreation = Date.now();

    // Проверяем формат выданного токена.
    assert.match(refreshToken, /^[a-f0-9]{64}$/);

    const tokenHash = hashToken(refreshToken);

    // Находим сессию по хешу выданного токена.
    const session = await RefreshSession.findOne({
      where: { tokenHash },
    });

    assert.ok(session);

    // Сессия принадлежит нужному пользователю.
    assert.equal(session.userId, user.id);

    // В БД хранится хеш, а не исходный refresh token.
    assert.equal(session.tokenHash, tokenHash);
    assert.notEqual(session.tokenHash, refreshToken);

    // Срок действия — 7 дней с момента создания.
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(session.expiresAt).getTime();

    assert.ok(expiresAt >= beforeCreation + sevenDaysMs);
    assert.ok(expiresAt <= afterCreation + sevenDaysMs);
  } finally {
    await User.destroy({
      where: { id: user.id },
    });
  }
});

test('rotate заменяет refresh token, сохраняя срок сессии', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken: oldToken } = await refreshSessionService.create(
      user.id
    );

    const oldHash = hashToken(oldToken);
    const sessionBefore = await RefreshSession.findOne({
      where: { tokenHash: oldHash },
    });

    assert.ok(sessionBefore);

    const { refreshToken: newToken } =
      await refreshSessionService.rotate(oldToken);

    assert.notEqual(newToken, oldToken);
    assert.match(newToken, /^[a-f0-9]{64}$/);

    const sessionAfter = await RefreshSession.findByPk(sessionBefore.id);

    assert.ok(sessionAfter);
    assert.equal(sessionAfter.tokenHash, hashToken(newToken));
    assert.notEqual(sessionAfter.tokenHash, oldHash);

    // ID сессии и абсолютный срок действия не изменились.
    assert.equal(sessionAfter.id, sessionBefore.id);
    assert.equal(
      sessionAfter.expiresAt.getTime(),
      sessionBefore.expiresAt.getTime()
    );
  } finally {
    await user.destroy();
  }
});

test('rotate отклоняет повторное использование старого токена', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken } = await refreshSessionService.create(user.id);

    await refreshSessionService.rotate(refreshToken);

    await assert.rejects(
      () => refreshSessionService.rotate(refreshToken),
      (error) => {
        assert.equal(error.statusCode, 401);
        assert.equal(error.code, 'REFRESH_TOKEN_REUSED');
        return true;
      }
    );

    const sessionCount = await RefreshSession.count({
      where: { userId: user.id },
    });

    assert.equal(sessionCount, 0);
  } finally {
    await user.destroy();
  }
});

test('rotate запрещает обновление просроченной сессии', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken } = await refreshSessionService.create(user.id);

    const tokenHash = hashToken(refreshToken);

    // Искусственно делаем сессию просроченной.
    await RefreshSession.update(
      { expiresAt: new Date(Date.now() - 60_000) },
      { where: { tokenHash } }
    );

    await assert.rejects(
      () => refreshSessionService.rotate(refreshToken),
      (error) => {
        assert.equal(error.statusCode, 401);
        assert.equal(error.code, 'INVALID_REFRESH_TOKEN');
        return true;
      }
    );

    // Проверяем, что хеш не был заменён.
    const session = await RefreshSession.findOne({
      where: { tokenHash },
    });

    assert.ok(session);
  } finally {
    await user.destroy();
  }
});

test('rotate отзывает сессию при конкурентном повторном использовании токена', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken } = await refreshSessionService.create(user.id);

    const results = await Promise.allSettled([
      refreshSessionService.rotate(refreshToken),
      refreshSessionService.rotate(refreshToken),
    ]);

    const successful = results.filter(
      (result) => result.status === 'fulfilled'
    );

    const rejected = results.filter((result) => result.status === 'rejected');

    // Только одна ротация может завершиться успешно.
    assert.equal(successful.length, 1);
    assert.equal(rejected.length, 1);

    // Второй запрос обнаруживает повторное использование.
    assert.equal(rejected[0].reason.statusCode, 401);
    assert.equal(rejected[0].reason.code, 'REFRESH_TOKEN_REUSED');

    // Полученный первым запросом токен больше нельзя использовать,
    // поскольку вся refresh-сессия была отозвана.
    const newToken = successful[0].value.refreshToken;

    const session = await RefreshSession.findOne({
      where: { tokenHash: hashToken(newToken) },
    });

    assert.equal(session, null);

    // У пользователя не осталось refresh-сессии этого теста.
    const sessionCount = await RefreshSession.count({
      where: { userId: user.id },
    });

    assert.equal(sessionCount, 0);
  } finally {
    await user.destroy();
  }
});

test('revoke удаляет refresh-сессию и историю использованных токенов', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken: oldToken } = await refreshSessionService.create(
      user.id
    );

    // Выполняем ротацию, чтобы появилась запись в истории.
    const { refreshToken: currentToken } =
      await refreshSessionService.rotate(oldToken);

    const session = await RefreshSession.findOne({
      where: { tokenHash: hashToken(currentToken) },
    });

    assert.ok(session);

    // Проверяем, что история старого токена существует.
    const usedTokenBefore = await UsedRefreshToken.findOne({
      where: { tokenHash: hashToken(oldToken) },
    });

    assert.ok(usedTokenBefore);

    // Завершаем сессию.
    const revoked = await refreshSessionService.revoke(currentToken);

    assert.equal(revoked, true);

    // Refresh-сессия удалена.
    const sessionAfter = await RefreshSession.findByPk(session.id);

    assert.equal(sessionAfter, null);

    // История удалена автоматически через ON DELETE CASCADE.
    const usedTokenAfter = await UsedRefreshToken.findByPk(usedTokenBefore.id);

    assert.equal(usedTokenAfter, null);
  } finally {
    await user.destroy();
  }
});

test('revoke безопасно обрабатывает повторный отзыв сессии', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken } = await refreshSessionService.create(user.id);

    const firstResult = await refreshSessionService.revoke(refreshToken);
    const secondResult = await refreshSessionService.revoke(refreshToken);

    assert.equal(firstResult, true);
    assert.equal(secondResult, false);

    assert.equal(
      await RefreshSession.count({
        where: { userId: user.id },
      }),
      0
    );

    // Некорректный токен не вызывает ошибку.
    assert.equal(await refreshSessionService.revoke('invalid-token'), false);
  } finally {
    await user.destroy();
  }
});
