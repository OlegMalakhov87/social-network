const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const { Op } = require('sequelize');

const { RefreshSession } = require('../../db/models');
const authSessionCleanupService = require('../../src/services/authSessionCleanupService');

test('cleanupExpired удаляет сессии с истёкшим expiresAt', async () => {
  const destroyMock = mock.method(RefreshSession, 'destroy', async () => 3);

  try {
    const before = Date.now();

    const result = await authSessionCleanupService.cleanupExpired();

    const after = Date.now();

    assert.equal(result, 3);
    assert.equal(destroyMock.mock.callCount(), 1);

    const [options] = destroyMock.mock.calls[0].arguments;

    const expiresAt = options.where.expiresAt[Op.lte];

    assert.ok(expiresAt instanceof Date);
    assert.ok(expiresAt.getTime() >= before);
    assert.ok(expiresAt.getTime() <= after);
  } finally {
    destroyMock.mock.restore();
  }
});

test('cleanupExpired возвращает 0 при отсутствии истёкших сессий', async () => {
  const destroyMock = mock.method(RefreshSession, 'destroy', async () => 0);

  try {
    const result = await authSessionCleanupService.cleanupExpired();

    assert.equal(result, 0);
    assert.equal(destroyMock.mock.callCount(), 1);
  } finally {
    destroyMock.mock.restore();
  }
});
