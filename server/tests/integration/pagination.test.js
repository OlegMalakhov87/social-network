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
let user;
let token;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => {
    if (server.listening) return resolve();
    server.once('listening', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  user = await User.create({
    name: `pagination-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  token = jwt.sign({ id: user.id, sid: sessionId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  await Post.create({
    userId: user.id,
    text: 'p1',
    type: 'text',
    isPublic: true,
  });
  await Post.create({
    userId: user.id,
    text: 'p2',
    type: 'text',
    isPublic: true,
  });
  await Post.create({
    userId: user.id,
    text: 'p3',
    type: 'text',
    isPublic: true,
  });
});

after(async () => {
  try {
    await Post.destroy({ where: { userId: user.id } });
    await user.destroy();
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

test('GET /posts/:id без page/limit → 200, дефолты применены', async () => {
  const response = await fetch(`${baseUrl}/api/posts/${user.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.pagination.currentPage, 1);
  assert.ok(body.posts.length > 0);
});

test('GET /posts/:id?page=abc → 400', async () => {
  const response = await fetch(`${baseUrl}/api/posts/${user.id}?page=abc`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 400);
});

test('GET /posts/:id?limit=0 → 400', async () => {
  const response = await fetch(`${baseUrl}/api/posts/${user.id}?limit=0`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 400);
});

test('GET /posts/:id?limit=100000000 → 400', async () => {
  const response = await fetch(
    `${baseUrl}/api/posts/${user.id}?limit=100000000`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  assert.equal(response.status, 400);
});

test('GET /posts/:id?page=2&limit=2 → 200, нормализовано в числа', async () => {
  const response = await fetch(
    `${baseUrl}/api/posts/${user.id}?page=2&limit=2`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.pagination.currentPage, 2);
  assert.ok(body.posts.length <= 2);
});
