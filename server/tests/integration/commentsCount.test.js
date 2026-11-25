const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');

const app = require('../../src/app');
const { redis } = require('../../src/lib/redis');
const refreshSessionService = require('../../src/services/refreshSessionService');
const {
  sequelize,
  User,
  Post,
  Video,
  Music,
  Comment,
  UserVideoLibrary,
  UserMusicLibrary,
} = require('../../db/models');

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

test('GET /posts/:userId возвращает точный commentsCount без раздувания', async () => {
  const user = await User.create({
    name: `count-test-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const post = await Post.create({
    userId: user.id,
    text: 'test post',
    type: 'text',
    isPublic: true,
  });

  // Создаём 5 комментариев — если count работает, вернётся 5.
  const comments = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      Comment.create({
        userId: user.id,
        targetType: 'Post',
        targetId: post.id,
        text: `comment ${i}`,
      })
    )
  );

  try {
    const response = await fetch(
      `${baseUrl}/api/posts/${user.id}?page=1&limit=30`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    assert.equal(response.status, 200);
    const body = await response.json();

    const found = body.posts.find((p) => p.id === post.id);
    assert.ok(found, 'Пост должен быть в ленте');
    assert.equal(found.commentsCount, 5, 'Точный счётчик');
    assert.equal(
      found.comments,
      undefined,
      'Массив comments не должен возвращаться'
    );
  } finally {
    for (const c of comments) await c.destroy();
    await post.destroy();
    await user.destroy();
  }
});

test('GET /uservideolibrary возвращает commentsCount для видео в библиотеке', async () => {
  const user = await User.create({
    name: `lib-test-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const video = await Video.create({
    uploadedBy: user.id,
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

  const library = await UserVideoLibrary.create({
    userId: user.id,
    videoId: video.id,
    isFavorite: false,
    viewsCount: 0,
  });

  const comments = await Promise.all(
    Array.from({ length: 3 }, (_, i) =>
      Comment.create({
        userId: user.id,
        targetType: 'Video',
        targetId: video.id,
        text: `comment ${i}`,
      })
    )
  );

  try {
    const response = await fetch(
      `${baseUrl}/api/uservideolibrary?page=1&limit=30&sortKey=dateDesc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    assert.equal(response.status, 200, 'Запрос должен пройти без 500');
    const body = await response.json();

    const found = body.videos.find((v) => v.id === video.id);
    assert.ok(found, 'Видео должно быть в библиотеке');
    assert.equal(found.commentsCount, 3, 'Точный счётчик комментариев');
  } finally {
    for (const c of comments) await c.destroy();
    await library.destroy();
    await video.destroy();
    await user.destroy();
  }
});

test('GET /usermusiclibrary  возвращает commentsCount для треков в библиотеке', async () => {
  const user = await User.create({
    name: `lib-test-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const { sessionId } = await refreshSessionService.create(user.id);
  const token = jwt.sign(
    { id: user.id, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const track = await Music.create({
    uploadedBy: user.id,
    title: 'test track',
    artist: 'test artist',
    duration: 60,
    size: 2048,
    audioUrl: '/uploads/music/tracks/test.mp3',
    coverUrl: '/uploads/music/covers/test.jpg',
    category: 'other',
    isPublic: true,
    playsCount: 0,
  });

  const library = await UserMusicLibrary.create({
    userId: user.id,
    trackId: track.id,
    isFavorite: false,
    playsCount: 0,
  });

  const comments = await Promise.all(
    Array.from({ length: 3 }, (_, i) =>
      Comment.create({
        userId: user.id,
        targetType: 'Music',
        targetId: track.id,
        text: `comment ${i}`,
      })
    )
  );

  try {
    const response = await fetch(
      `${baseUrl}/api/usermusiclibrary?page=1&limit=30&sortKey=dateDesc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    assert.equal(response.status, 200, 'Запрос должен пройти без 500');
    const body = await response.json();

    const found = body.tracks.find((t) => t.id === track.id);
    assert.ok(found, 'Трек должен быть в библиотеке');
    assert.equal(found.commentsCount, 3, 'Точный счётчик комментариев');
  } finally {
    for (const c of comments) await c.destroy();
    await library.destroy();
    await track.destroy();
    await user.destroy();
  }
});
