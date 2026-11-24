const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Comment } = require('../../db/models');

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
    name: `comment-update-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const comment = await Comment.create({
    userId: user.id,
    targetType: 'Post',
    targetId: 1,
    text: 'original comment',
    isEdited: false,
  });

  return { user, token, comment };
};

test('PATCH /comments/:commentId/update не ставит isEdited, если ничего не изменилось', async () => {
  const { user, token, comment } = await setup();

  try {
    const response = await fetch(
      `${baseUrl}/api/comments/${comment.id}/update`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: 1,
          text: 'original comment',
          targetType: 'posts',
        }),
      }
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(
      body.comment.isEdited,
      false,
      'isEdited должен остаться false'
    );
  } finally {
    await comment.destroy();
    await user.destroy();
  }
});

test('PATCH /comments/:commentId/update ставит isEdited при реальном изменении', async () => {
  const { user, token, comment } = await setup();

  try {
    const response = await fetch(
      `${baseUrl}/api/comments/${comment.id}/update`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: 1,
          text: 'changed comment',
          targetType: 'posts',
        }),
      }
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.comment.isEdited, true);
    assert.equal(body.comment.text, 'changed comment');
  } finally {
    await comment.destroy();
    await user.destroy();
  }
});

test('PATCH /comments/:commentId/update не сбрасывает isEdited=false→true→false', async () => {
  const { user, token, comment } = await setup();

  await comment.update({ text: 'edited once', isEdited: true });

  try {
    const response = await fetch(
      `${baseUrl}/api/comments/${comment.id}/update`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: 1,
          text: 'edited once',
          targetType: 'posts',
        }),
      }
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(
      body.comment.isEdited,
      true,
      'isEdited должен остаться true — комментарий уже был отредактирован'
    );
  } finally {
    await comment.destroy();
    await user.destroy();
  }
});
