const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Message } = require('../../db/models');

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

test('GET /messages/:id/shared → 200 для отправителя', async () => {
  const sender = await createUser('sender');
  const receiver = await createUser('receiver');
  const token = await signToken(sender);

  const msg = await Message.create({
    senderId: sender.id,
    receiverId: receiver.id,
    content: 'private message',
    isRead: false,
    isEdited: false,
    deletedBySender: false,
    deletedByReceiver: false,
  });

  try {
    const response = await fetch(`${baseUrl}/api/messages/${msg.id}/shared`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message.content, 'private message');
  } finally {
    await msg.destroy();
    await sender.destroy();
    await receiver.destroy();
  }
});

test('GET /messages/:id/shared → 200 для получателя', async () => {
  const sender = await createUser('sender');
  const receiver = await createUser('receiver');
  const token = await signToken(receiver);

  const msg = await Message.create({
    senderId: sender.id,
    receiverId: receiver.id,
    content: 'private message',
    isRead: false,
    isEdited: false,
    deletedBySender: false,
    deletedByReceiver: false,
  });

  try {
    const response = await fetch(`${baseUrl}/api/messages/${msg.id}/shared`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 200);
  } finally {
    await msg.destroy();
    await sender.destroy();
    await receiver.destroy();
  }
});

test('GET /messages/:id/shared → 404 для постороннего', async () => {
  const sender = await createUser('sender');
  const receiver = await createUser('receiver');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const msg = await Message.create({
    senderId: sender.id,
    receiverId: receiver.id,
    content: 'private message',
    isRead: false,
    isEdited: false,
    deletedBySender: false,
    deletedByReceiver: false,
  });

  try {
    const response = await fetch(`${baseUrl}/api/messages/${msg.id}/shared`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, 'MESSAGE_NOT_FOUND');
  } finally {
    await msg.destroy();
    await sender.destroy();
    await receiver.destroy();
    await stranger.destroy();
  }
});
