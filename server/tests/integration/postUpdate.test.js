const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Post } = require('../../db/models');

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

const setup = async () => {
  const user = await User.create({
    name: `post-update-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const post = await Post.create({
    userId: user.id,
    text: 'original text',
    type: 'text',
    isPublic: true,
    isEdited: false,
  });

  return { user, token, post };
};

test('PUT /posts/:id/update не ставит isEdited, если ничего не изменилось', async () => {
  const { user, token, post } = await setup();

  try {
    const response = await fetch(`${baseUrl}/api/posts/${post.id}/update`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'original text',
        type: 'text',
        isPublic: true,
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.post.isEdited, false, 'isEdited должен остаться false');
  } finally {
    await post.destroy();
    await user.destroy();
  }
});

test('PUT /posts/:id/update ставит isEdited при реальном изменении', async () => {
  const { user, token, post } = await setup();

  try {
    const response = await fetch(`${baseUrl}/api/posts/${post.id}/update`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'changed text',
        type: 'text',
        isPublic: true,
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.post.isEdited, true);
  } finally {
    await post.destroy();
    await user.destroy();
  }
});

test('PUT /posts/:id/update не сбрасывает isEdited=false→true→false', async () => {
  const { user, token, post } = await setup();

  // Сначала реально редактируем
  await post.update({ text: 'edited once', isEdited: true });

  try {
    // Потом отправляем без изменений
    const response = await fetch(`${baseUrl}/api/posts/${post.id}/update`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'edited once',
        type: 'text',
        isPublic: true,
      }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(
      body.post.isEdited,
      true,
      'isEdited должен остаться true — пост уже был отредактирован'
    );
  } finally {
    await post.destroy();
    await user.destroy();
  }
});
