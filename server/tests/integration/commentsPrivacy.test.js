const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Post, Comment } = require('../../db/models');

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

const signToken = async (user) => {
  const { sessionId } = await refreshSessionService.create(user.id);
  return jwt.sign({ id: user.id, sid: sessionId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

test('GET /comments/posts/:id → 200 для публичного поста', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const post = await Post.create({
    userId: owner.id,
    text: 'public post',
    type: 'text',
    isPublic: true,
  });
  const comment = await Comment.create({
    userId: owner.id,
    targetType: 'Post',
    targetId: post.id,
    text: 'comment',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/comments/posts/${post.id}?page=1&limit=30`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.comments[0].text, 'comment');
  } finally {
    await comment.destroy();
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('GET /comments/posts/:id → 404 для чужого приватного поста', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const post = await Post.create({
    userId: owner.id,
    text: 'private post',
    type: 'text',
    isPublic: false,
  });
  const comment = await Comment.create({
    userId: owner.id,
    targetType: 'Post',
    targetId: post.id,
    text: 'secret comment',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/comments/posts/${post.id}?page=1&limit=30`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, 'ENTITY_NOT_FOUND');
  } finally {
    await comment.destroy();
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('GET /comments/:id/shared → 200 для комментария публичного поста', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const post = await Post.create({
    userId: owner.id,
    text: 'public post',
    type: 'text',
    isPublic: true,
  });
  const comment = await Comment.create({
    userId: owner.id,
    targetType: 'Post',
    targetId: post.id,
    text: 'comment',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/comments/${comment.id}/shared`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.comment.text, 'comment');
  } finally {
    await comment.destroy();
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('GET /comments/:id/shared → 404 для комментария к приватному посту', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const post = await Post.create({
    userId: owner.id,
    text: 'private post',
    type: 'text',
    isPublic: false,
  });
  const comment = await Comment.create({
    userId: owner.id,
    targetType: 'Post',
    targetId: post.id,
    text: 'secret comment',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/comments/${comment.id}/shared`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, 'ENTITY_NOT_FOUND');
  } finally {
    await comment.destroy();
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});
