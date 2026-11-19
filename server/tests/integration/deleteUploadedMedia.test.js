const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const temporaryMediaService = require('../../src/services/temporaryMediaService');
const { sequelize, User, TemporaryMedia } = require('../../db/models');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

const createTestEmail = () =>
  `test-${randomUUID().replaceAll('-', '')}@example.com`;

const createUser = async () => {
  const user = await User.create({
    name: `test-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  return { user, token };
};

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

test('POST /posts/delete-uploaded-media → 400 при пустом теле', async () => {
  const { user, token } = await createUser();

  try {
    const response = await fetch(`${baseUrl}/api/posts/delete-uploaded-media`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.code, 'NO_MEDIA_TO_DELETE');
  } finally {
    await user.destroy();
  }
});

test('POST /posts/delete-uploaded-media → 200 удаляет одно переданное поле', async () => {
  const { user, token } = await createUser();
  const url = `/uploads/posts/images/${randomUUID()}.jpg`;

  await temporaryMediaService.registerMany([
    {
      userId: user.id,
      url,
      mediaType: 'image',
      fieldName: 'postUrl',
    },
  ]);

  try {
    const response = await fetch(`${baseUrl}/api/posts/delete-uploaded-media`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postUrl: url }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.deleted, 1);

    const remaining = await TemporaryMedia.findOne({ where: { url } });
    assert.equal(remaining, null);
  } finally {
    await user.destroy();
  }
});

test('POST /videos/delete-uploaded-video → 400 при пустом теле', async () => {
  const { user, token } = await createUser();

  try {
    const response = await fetch(
      `${baseUrl}/api/videos/delete-uploaded-video`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.code, 'NO_MEDIA_TO_DELETE');
  } finally {
    await user.destroy();
  }
});

test('POST /videos/delete-uploaded-thumb → 400 при пустом теле', async () => {
  const { user, token } = await createUser();

  try {
    const response = await fetch(
      `${baseUrl}/api/videos/delete-uploaded-thumb`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.code, 'NO_MEDIA_TO_DELETE');
  } finally {
    await user.destroy();
  }
});

test('POST /videos/delete-uploaded-preview → 400 при пустом теле', async () => {
  const { user, token } = await createUser();

  try {
    const response = await fetch(
      `${baseUrl}/api/videos/delete-uploaded-preview`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      }
    );

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.code, 'NO_MEDIA_TO_DELETE');
  } finally {
    await user.destroy();
  }
});
