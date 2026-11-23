const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const temporaryMediaService = require('../../src/services/temporaryMediaService');
const { sequelize, User } = require('../../db/models');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

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

test('POST /api/music/add создаёт трек без обложки', async () => {
  const user = await User.create({
    name: `music-test-${randomUUID()}`,
    email: `test-${randomUUID().replaceAll('-', '')}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const audioUrl = `/uploads/music/tracks/test-${randomUUID()}.mp3`;

  await temporaryMediaService.registerMany([
    {
      userId: user.id,
      url: audioUrl,
      mediaType: 'audio',
      fieldName: 'audioUrl',
    },
  ]);

  try {
    const response = await fetch(`${baseUrl}/api/music/add`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Track',
        artist: 'Test Artist',
        audioUrl,
        category: 'other',
        size: 2048,
        duration: 120,
        isPublic: true,
      }),
    });

    assert.equal(response.status, 201, 'Должен быть 201 Created');
    const body = await response.json();
    assert.ok(body.track?.id, 'Вернулся трек');
    assert.equal(body.track.audioUrl, audioUrl);
    assert.equal(body.track.coverUrl, null);
  } finally {
    await user.destroy();
  }
});
