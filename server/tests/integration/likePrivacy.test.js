const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Post, Comment, Message } = require('../../db/models');

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

test('POST /likes/:targetType/:targetId/add → 404 для чужого приватного поста', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const post = await Post.create({
    userId: owner.id,
    text: 'private post',
    type: 'text',
    isPublic: false,
  });

  try {
    const response = await fetch(`${baseUrl}/api/likes/posts/${post.id}/add`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, 'ENTITY_NOT_FOUND');
  } finally {
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('POST /likes/:targetType/:targetId/add → 404 для комментария к чужому приватному посту', async () => {
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
    text: 'private comment',
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/likes/comments/${comment.id}/add`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    assert.equal(response.status, 404);
  } finally {
    await comment.destroy();
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('POST /likes/:targetType/:targetId/add → 404 для чужого сообщения', async () => {
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
    const response = await fetch(
      `${baseUrl}/api/likes/messages/${msg.id}/add`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    assert.equal(response.status, 404);
  } finally {
    await msg.destroy();
    await sender.destroy();
    await receiver.destroy();
    await stranger.destroy();
  }
});

test('POST /:targetType/:targetId/add → 201 для публичного поста', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const post = await Post.create({
    userId: owner.id,
    text: 'public post',
    type: 'text',
    isPublic: true,
  });

  try {
    const response = await fetch(`${baseUrl}/api/likes/posts/${post.id}/add`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 201);
  } finally {
    await post.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});
