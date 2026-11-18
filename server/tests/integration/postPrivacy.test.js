const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Post, Friend } = require('../../db/models');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

const createTestEmail = () =>
  `post-test-${randomUUID().replaceAll('-', '')}@example.com`;

const createUser = async (name) =>
  User.create({
    name: `${name}-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

const signToken = async (user) => {
  const { sessionId } = await refreshSessionService.create(user.id);
  return jwt.sign({ id: user.id, sid: sessionId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
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

test('GET /posts/:id/shared → 200 для своего поста', async () => {
  const owner = await createUser('owner');
  const token = await signToken(owner);
  const post = await Post.create({
    userId: owner.id,
    text: 'private to me',
    type: 'text',
    isPublic: false,
  });

  try {
    const response = await fetch(`${baseUrl}/api/posts/${post.id}/shared`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.post.id, post.id);
  } finally {
    await post.destroy();
    await owner.destroy();
  }
});

test('GET /posts/:id/shared → 200 для чужого публичного поста', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);
  const post = await Post.create({
    userId: owner.id,
    text: 'public',
    type: 'text',
    isPublic: true,
  });

  try {
    const response = await fetch(`${baseUrl}/api/posts/${post.id}/shared`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 200);
  } finally {
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('GET /posts/:id/shared → 404 для чужого приватного поста', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);
  const post = await Post.create({
    userId: owner.id,
    text: 'secret',
    type: 'text',
    isPublic: false,
  });

  try {
    const response = await fetch(`${baseUrl}/api/posts/${post.id}/shared`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, 'POST_NOT_FOUND');
  } finally {
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('GET /posts/:id/shared → 200 для чужого приватного поста, если автор — друг', async () => {
  const owner = await createUser('owner');
  const friend = await createUser('friend');
  const token = await signToken(friend);
  const post = await Post.create({
    userId: owner.id,
    text: 'for friends only',
    type: 'text',
    isPublic: false,
  });
  const friendship = await Friend.create({
    userId: owner.id,
    friendId: friend.id,
    status: 'accepted',
  });

  try {
    const response = await fetch(`${baseUrl}/api/posts/${post.id}/shared`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 200);
  } finally {
    await friendship.destroy();
    await post.destroy();
    await owner.destroy();
    await friend.destroy();
  }
});
