const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { acquireLock } = require('../../src/utils/acquireLock');
const { redis } = require('../../src/lib/redis');
const { sequelize } = require('../../db/models');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Тесты разрешены только в socialnet_test');
}

before(async () => {
  // Убедимся, что Redis доступен.
  await redis.ping();
});

beforeEach(async () => {
  await redis.del('test-lock-key');
});

after(async () => {
  await redis.del('test-lock-key');
  redis.disconnect();
  await sequelize.close();
});

test('acquireLock возвращает release для первого вызова', async () => {
  const release = await acquireLock('test-lock-key', 60);
  assert.ok(typeof release === 'function');

  const value = await redis.get('test-lock-key');
  assert.ok(value, 'Ключ должен быть установлен');

  await release();

  const afterRelease = await redis.get('test-lock-key');
  assert.equal(afterRelease, null, 'Ключ должен быть удалён');
});

test('acquireLock возвращает null, если лок уже занят', async () => {
  const release = await acquireLock('test-lock-key', 60);
  assert.ok(release);

  const second = await acquireLock('test-lock-key', 60);
  assert.equal(second, null, 'Второй вызов должен вернуть null');

  await release();
});

test('release не удаляет чужой лок (проверка через value)', async () => {
  const release = await acquireLock('test-lock-key', 60);

  // Имитируем ситуацию: TTL истёк, другой инстанс взял лок.
  await redis.del('test-lock-key');
  const foreignRelease = await acquireLock('test-lock-key', 60);

  // Первый release не должен снести чужой лок.
  await release();

  const stillOwned = await redis.get('test-lock-key');
  assert.ok(stillOwned, 'Лок должен остаться за вторым инстансом');

  await foreignRelease();
});

test('acquireLock устанавливает TTL', async () => {
  const release = await acquireLock('test-lock-key', 5);

  const ttl = await redis.ttl('test-lock-key');
  assert.ok(ttl > 0 && ttl <= 5, `TTL должен быть ~5 секунд, получено ${ttl}`);

  await release();
});
