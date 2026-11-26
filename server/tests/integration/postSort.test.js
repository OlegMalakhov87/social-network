const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Post, Like } = require('../../db/models');

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

const createUser = async (name) =>
  User.create({
    name: `${name}-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

test('GET /posts/:id?sortKey=viewsDesc → 200 и сортирует по лайкам', async () => {
  const owner = await createUser('owner');
  const { sessionId } = await refreshSessionService.create(owner.id);
  const token = jwt.sign(
    { id: owner.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const postLow = await Post.create({
    userId: owner.id,
    text: 'one like',
    type: 'text',
    isPublic: true,
  });
  const postHigh = await Post.create({
    userId: owner.id,
    text: 'three likes',
    type: 'text',
    isPublic: true,
  });

  const likers = await Promise.all(
    Array.from({ length: 3 }, () => createUser('liker'))
  );

  const likes = [];
  // postLow — 1 лайк, postHigh — 3 лайка.
  likes.push(
    await Like.create({
      userId: likers[0].id,
      targetType: 'Post',
      targetId: postLow.id,
    })
  );
  likes.push(
    await Like.create({
      userId: likers[0].id,
      targetType: 'Post',
      targetId: postHigh.id,
    })
  );
  likes.push(
    await Like.create({
      userId: likers[1].id,
      targetType: 'Post',
      targetId: postHigh.id,
    })
  );
  likes.push(
    await Like.create({
      userId: likers[2].id,
      targetType: 'Post',
      targetId: postHigh.id,
    })
  );

  try {
    const response = await fetch(
      `${baseUrl}/api/posts/${owner.id}?page=1&limit=30&sortKey=viewsDesc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    assert.equal(
      response.status,
      200,
      `Ожидалось 200, получено ${response.status}`
    );
    const body = await response.json();

    const order = body.posts.map((p) => p.id);
    assert.equal(order[0], postHigh.id, 'Пост с 3 лайками должен быть первым');
    assert.equal(order[1], postLow.id, 'Пост с 1 лайком — вторым');
  } finally {
    for (const l of likes) await l.destroy();
    for (const liker of likers) await liker.destroy();
    await postLow.destroy();
    await postHigh.destroy();
    await owner.destroy();
  }
});
