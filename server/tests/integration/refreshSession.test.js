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
 * Останавливает сервер.
 * @returns {Promise<void>}
 */
after(async () => {
  await sequelize.close();
});

/**
 * Создает тестового пользователя.
 * @returns {Promise<User>}
 */
const createTestUser = async () => {
  return User.create({
    name: 'Refresh Test User',
    email: `test-${randomUUID().replaceAll('-', '')}@example.com`,
    passwordHash: '$2b$10$' + 'a'.repeat(53),
    gender: 'male',
  });
};

/**
 * Хеширует refresh token.
 * @param {string} token
 * @returns {string}
 */
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

    assert.match(refreshToken, /^[a-f0-9]{64}$/);

    const tokenHash = hashToken(refreshToken);

    const session = await RefreshSession.findOne({
      where: { tokenHash },
    });

    assert.ok(session);

    assert.equal(session.userId, user.id);

    assert.equal(session.tokenHash, tokenHash);
    assert.notEqual(session.tokenHash, refreshToken);

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

    assert.equal(successful.length, 1);
    assert.equal(rejected.length, 1);

    assert.equal(rejected[0].reason.statusCode, 401);
    assert.equal(rejected[0].reason.code, 'REFRESH_TOKEN_REUSED');

    const newToken = successful[0].value.refreshToken;

    const session = await RefreshSession.findOne({
      where: { tokenHash: hashToken(newToken) },
    });

    assert.equal(session, null);

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

    const { refreshToken: currentToken } =
      await refreshSessionService.rotate(oldToken);

    const session = await RefreshSession.findOne({
      where: { tokenHash: hashToken(currentToken) },
    });

    assert.ok(session);

    const usedTokenBefore = await UsedRefreshToken.findOne({
      where: { tokenHash: hashToken(oldToken) },
    });

    assert.ok(usedTokenBefore);

    const { revoked } = await refreshSessionService.revoke(
      currentToken,
      session.id
    );

    assert.equal(revoked, true);

    const sessionAfter = await RefreshSession.findByPk(session.id);

    assert.equal(sessionAfter, null);

    const usedTokenAfter = await UsedRefreshToken.findByPk(usedTokenBefore.id);

    assert.equal(usedTokenAfter, null);
  } finally {
    await user.destroy();
  }
});

test('revoke безопасно обрабатывает повторный отзыв сессии и некорректный токен', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken, sessionId } = await refreshSessionService.create(
      user.id
    );

    const firstResult = await refreshSessionService.revoke(
      refreshToken,
      sessionId
    );
    const secondResult = await refreshSessionService.revoke(
      refreshToken,
      sessionId
    );

    assert.equal(firstResult.revoked, true);
    assert.equal(secondResult.revoked, false);
    assert.equal(secondResult.reason, 'NOT_FOUND');

    assert.equal(
      await RefreshSession.count({
        where: { userId: user.id },
      }),
      0
    );

    assert.equal(
      (
        await refreshSessionService.revoke(
          'invalid-token',
          'invalid-session-id'
        )
      ).revoked,
      false
    );

    assert.equal(
      (
        await refreshSessionService.revoke(
          'invalid-token',
          'invalid-session-id'
        )
      ).reason,
      'NOT_FOUND'
    );
  } finally {
    await user.destroy();
  }
});

test('revoke безопасно обрабатывает чужой sessionId, запись в БД не удаляется', async () => {
  const user = await createTestUser();
  const otherUser = await createTestUser();

  try {
    const { refreshToken, sessionId } = await refreshSessionService.create(
      user.id
    );

    const {
      refreshToken: otherUserRefreshToken,
      sessionId: otherUserSessionId,
    } = await refreshSessionService.create(otherUser.id);

    const { revoked, reason } = await refreshSessionService.revoke(
      refreshToken,
      otherUserSessionId
    );

    assert.equal(revoked, false);
    assert.equal(reason, 'SESSION_CHANGED');

    const originalUserSession = await RefreshSession.findOne({
      where: { userId: user.id },
    });
    assert.ok(
      originalUserSession,
      'Сессия пользователя не должна быть удалена при несовпадении ID сессий'
    );
    assert.equal(originalUserSession.tokenHash, hashToken(refreshToken));
    assert.equal(originalUserSession.id, sessionId);

    const otherUserSession = await RefreshSession.findOne({
      where: { userId: otherUser.id },
    });
    assert.ok(
      otherUserSession,
      'Сессия другого пользователя не должна быть удалена при несовпадении ID сессий'
    );
    assert.equal(otherUserSession.tokenHash, hashToken(otherUserRefreshToken));
    assert.equal(otherUserSession.id, otherUserSessionId);
  } finally {
    await user.destroy();
    await otherUser.destroy();
  }
});

test('устаревший refresh token: возвращается NOT_FOUND, новая сессия не удаляется', async () => {
  const user = await createTestUser();

  try {
    const { refreshToken, sessionId } = await refreshSessionService.create(
      user.id
    );

    const rotated = await refreshSessionService.rotate(refreshToken);

    const result = await refreshSessionService.revoke(refreshToken, sessionId);

    assert.equal(result.revoked, false);
    assert.equal(result.reason, 'NOT_FOUND');

    const sessionInDb = await RefreshSession.findByPk(sessionId);

    assert.ok(sessionInDb, 'Запись в БД должна существовать');
    assert.equal(sessionInDb.tokenHash, hashToken(rotated.refreshToken));
    assert.notEqual(sessionInDb.tokenHash, hashToken(refreshToken));
  } finally {
    await user.destroy();
  }
});
