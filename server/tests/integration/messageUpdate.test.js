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

const setup = async () => {
  const sender = await User.create({
    name: `msg-sender-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const receiver = await User.create({
    name: `msg-receiver-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(sender.id);
  const token = jwt.sign(
    { id: sender.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const msg = await Message.create({
    senderId: sender.id,
    receiverId: receiver.id,
    content: 'original text',
    isRead: false,
    isEdited: false,
    deletedBySender: false,
    deletedByReceiver: false,
  });

  return { sender, receiver, token, msg };
};

test('PATCH /messages/:messageId/edit не ставит isEdited, если ничего не изменилось', async () => {
  const { sender, receiver, token, msg } = await setup();

  try {
    const response = await fetch(`${baseUrl}/api/messages/${msg.id}/edit`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'original text' }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(
      body.message.isEdited,
      false,
      'isEdited должен остаться false'
    );
  } finally {
    await msg.destroy();
    await sender.destroy();
    await receiver.destroy();
  }
});

test('PATCH /messages/:id/edit ставит isEdited при реальном изменении', async () => {
  const { sender, receiver, token, msg } = await setup();

  try {
    const response = await fetch(`${baseUrl}/api/messages/${msg.id}/edit`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'changed text' }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message.isEdited, true);
    assert.equal(body.message.content, 'changed text');
  } finally {
    await msg.destroy();
    await sender.destroy();
    await receiver.destroy();
  }
});

test('PATCH /messages/:id/edit не сбрасывает isEdited=false→true→false', async () => {
  const { sender, receiver, token, msg } = await setup();

  await msg.update({ content: 'edited once', isEdited: true });

  try {
    const response = await fetch(`${baseUrl}/api/messages/${msg.id}/edit`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: 'edited once' }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(
      body.message.isEdited,
      true,
      'isEdited должен остаться true — сообщение уже было отредактировано'
    );
  } finally {
    await msg.destroy();
    await sender.destroy();
    await receiver.destroy();
  }
});
