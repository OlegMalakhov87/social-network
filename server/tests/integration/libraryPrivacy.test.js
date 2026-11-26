const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const { sequelize, User, Music, Video } = require('../../db/models');

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

test('POST /usermusiclibrary/:trackId/add → 404 для чужого приватного трека', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const track = await Music.create({
    uploadedBy: owner.id,
    title: 'private track',
    artist: 'artist',
    duration: 60,
    size: 2048,
    audioUrl: '/uploads/music/tracks/test.mp3',
    coverUrl: null,
    category: 'other',
    isPublic: false,
    playsCount: 0,
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/usermusiclibrary/${track.id}/add`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackId: track.id }),
      }
    );
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, 'ENTITY_NOT_FOUND');
  } finally {
    await track.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('POST /usermusiclibrary/:trackId/add → 201 для публичного трека', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const track = await Music.create({
    uploadedBy: owner.id,
    title: 'public track',
    artist: 'artist',
    duration: 60,
    size: 2048,
    audioUrl: '/uploads/music/tracks/test.mp3',
    coverUrl: null,
    category: 'other',
    isPublic: true,
    playsCount: 0,
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/usermusiclibrary/${track.id}/add`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackId: track.id }),
      }
    );
    assert.equal(
      response.status,
      201,
      `Ожидалось 201, получено ${response.status}: ${JSON.stringify(await response.json())}`
    );
  } finally {
    await track.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('POST /uservideolibrary/:videoId/add  → 404 для чужого приватного видео', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const video = await Video.create({
    uploadedBy: owner.id,
    title: 'test video',
    duration: 60,
    size: 2048,
    videoUrl: '/uploads/videos/video/test.mp4',
    thumbnailUrl: '/uploads/videos/thumbnails/test.jpg',
    previewUrl: '/uploads/videos/previews/test.mp4',
    category: 'other',
    isPublic: false,
    viewsCount: 0,
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/uservideolibrary/${video.id}/add`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: video.id }),
      }
    );
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.code, 'ENTITY_NOT_FOUND');
  } finally {
    await video.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});

test('POST /uservideolibrary/:videoId/add → 201 для публичного видео', async () => {
  const owner = await createUser('owner');
  const stranger = await createUser('stranger');
  const token = await signToken(stranger);

  const video = await Video.create({
    uploadedBy: owner.id,
    title: 'test video',
    duration: 60,
    size: 2048,
    videoUrl: '/uploads/videos/video/test.mp4',
    thumbnailUrl: '/uploads/videos/thumbnails/test.jpg',
    previewUrl: '/uploads/videos/previews/test.mp4',
    category: 'other',
    isPublic: true,
    viewsCount: 0,
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/uservideolibrary/${video.id}/add`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: video.id }),
      }
    );
    assert.equal(
      response.status,
      201,
      `Ожидалось 201, получено ${response.status}: ${JSON.stringify(await response.json())}`
    );
  } finally {
    await video.destroy();
    await owner.destroy();
    await stranger.destroy();
  }
});
