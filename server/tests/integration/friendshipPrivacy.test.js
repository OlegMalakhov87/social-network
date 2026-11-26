const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Friend } = require('../../db/models');

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

test('PATCH /friends/:friendshipId/accept → 404 для постороннего', async () => {
  const sender = await createUser('sender');
  const receiver = await createUser('receiver');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const friendship = await Friend.create({
    userId: sender.id,
    friendId: receiver.id,
    status: 'pending',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/${friendship.id}/accept`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 404);
  } finally {
    await friendship.destroy();
    await sender.destroy();
    await receiver.destroy();
    await stranger.destroy();
  }
});

test('PATCH /friends//:friendshipId/accept → 404 для blocked (не превращается в дружбу)', async () => {
  const blocker = await createUser('blocker');
  const blocked = await createUser('blocked');
  const token = await signToken(blocked);

  const friendship = await Friend.create({
    userId: blocker.id,
    friendId: blocked.id,
    status: 'blocked',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/${friendship.id}/accept`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 404);

    // Статус в БД не изменился.
    const fresh = await Friend.findByPk(friendship.id);
    assert.equal(fresh.status, 'blocked');
  } finally {
    await friendship.destroy();
    await blocker.destroy();
    await blocked.destroy();
  }
});

test('PATCH /friends/:friendshipId/accept → 200 для pending получателем', async () => {
  const sender = await createUser('sender');
  const receiver = await createUser('receiver');
  const token = await signToken(receiver);

  const friendship = await Friend.create({
    userId: sender.id,
    friendId: receiver.id,
    status: 'pending',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/${friendship.id}/accept`,
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 200);
    const fresh = await Friend.findByPk(friendship.id);
    assert.equal(fresh.status, 'accepted');
  } finally {
    await friendship.destroy();
    await sender.destroy();
    await receiver.destroy();
  }
});

test('DELETE /friends/:friendshipId/reject → 404 для постороннего (запись не удалена)', async () => {
  const a = await createUser('a');
  const b = await createUser('b');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const friendship = await Friend.create({
    userId: a.id,
    friendId: b.id,
    status: 'accepted',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/${friendship.id}/reject`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 404);

    // Запись на месте.
    const fresh = await Friend.findByPk(friendship.id);
    assert.ok(fresh);
  } finally {
    await friendship.destroy();
    await a.destroy();
    await b.destroy();
    await stranger.destroy();
  }
});

test('DELETE /friends/:friendshipId/reject → 404 для blocked от заблокированного', async () => {
  const blocker = await createUser('blocker');
  const blocked = await createUser('blocked');
  const token = await signToken(blocked);

  const friendship = await Friend.create({
    userId: blocker.id,
    friendId: blocked.id,
    status: 'blocked',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/${friendship.id}/reject`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 404);
    const fresh = await Friend.findByPk(friendship.id);
    assert.ok(fresh, 'Заблокированный не может снять блокировку');
  } finally {
    await friendship.destroy();
    await blocker.destroy();
    await blocked.destroy();
  }
});

test('DELETE /friends/:friendshipId/reject → 200 для blocked от инициатора', async () => {
  const blocker = await createUser('blocker');
  const blocked = await createUser('blocked');
  const token = await signToken(blocker);

  const friendship = await Friend.create({
    userId: blocker.id,
    friendId: blocked.id,
    status: 'blocked',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/${friendship.id}/reject`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 200);
    const fresh = await Friend.findByPk(friendship.id);
    assert.equal(fresh, null);
  } finally {
    await friendship.destroy().catch(() => {});
    await blocker.destroy();
    await blocked.destroy();
  }
});

test('GET /friends/with-friendship-status скрывает поля приватного профиля для не-друга', async () => {
  const owner = await User.create({
    name: `private-owner-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
    isPublic: false,
    address: 'secret address',
    job: 'secret job',
    status: 'secret status',
    birthDate: '2000-01-01',
  });
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/with-friendship-status?page=1&limit=100&q=private-owner`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 200);
    const body = await response.json();

    const found = body.users.find((u) => u.id === owner.id);
    assert.ok(found, 'Владелец должен быть в выдаче');
    assert.equal(found.name, owner.name);
    assert.equal(found.avatarUrl, owner.avatarUrl);
    assert.equal(found.address, undefined);
    assert.equal(found.job, undefined);
    assert.equal(found.status, undefined);
    assert.equal(found.birthDate, undefined);
    assert.equal(found.isPublic, undefined);
  } finally {
    await owner.destroy();
    await stranger.destroy();
  }
});

test('GET /friends/with-friendship-status показывает поля приватного профиля другу', async () => {
  const owner = await User.create({
    name: `private-owner-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
    isPublic: false,
    address: 'friend-visible address',
    job: 'friend-visible job',
  });
  const friend = await createUser('friend');
  const token = await signToken(friend);

  const friendship = await Friend.create({
    userId: owner.id,
    friendId: friend.id,
    status: 'accepted',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/friends/with-friendship-status?page=1&limit=100&q=private-owner`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    assert.equal(response.status, 200);
    const body = await response.json();

    const found = body.users.find((u) => u.id === owner.id);
    assert.ok(found);
    assert.equal(found.address, 'friend-visible address');
    assert.equal(found.job, 'friend-visible job');
    assert.equal(found.isPublic, false);
  } finally {
    await friendship.destroy();
    await owner.destroy();
    await friend.destroy();
  }
});
