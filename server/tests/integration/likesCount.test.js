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
  Like,
  User,
  Post,
  Video,
  UserVideoLibrary,
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

const createUser = async (namePrefix = 'user') =>
  User.create({
    name: `${namePrefix}-${randomUUID()}`,
    email: createTestEmail(),
    passwordHash: await bcrypt.hash('test-password', 4),
  });

const signToken = async (user) => {
  const { sessionId } = await refreshSessionService.create(user.id);
  return jwt.sign({ id: user.id, sid: sessionId }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

test('GET /posts/:userId возвращает точный likesCount и isLiked без массива', async () => {
  const owner = await createUser('owner');
  const viewer = await createUser('viewer');
  const token = await signToken(viewer);

  const likers = await Promise.all(
    Array.from({ length: 5 }, () => createUser('liker'))
  );

  const post = await Post.create({
    userId: owner.id,
    text: 'test post',
    type: 'text',
    isPublic: true,
  });

  const likes = await Promise.all(
    likers.map((liker) =>
      Like.create({
        userId: liker.id,
        targetType: 'Post',
        targetId: post.id,
      })
    )
  );

  const viewerLike = await Like.create({
    userId: viewer.id,
    targetType: 'Post',
    targetId: post.id,
  });

  try {
    const response = await fetch(
      `${baseUrl}/api/posts/${owner.id}?page=1&limit=30`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    assert.equal(response.status, 200);
    const body = await response.json();

    const found = body.posts.find((p) => p.id === post.id);
    assert.ok(found, 'Пост должен быть в ленте');
    assert.equal(found.likesCount, 6, 'Точный счётчик (5 likers + viewer)');
    assert.equal(found.isLiked, true, 'viewer лайкнул');
    assert.equal(found.likes, undefined, 'Массив likes не возвращается');
  } finally {
    await viewerLike.destroy();
    for (const l of likes) await l.destroy();
    await post.destroy();
    for (const liker of likers) await liker.destroy();
    await viewer.destroy();
    await owner.destroy();
  }
});

test('GET /uservideolibrary возвращает likesCount для видео в библиотеке', async () => {
  const user = await createUser('lib');
  const token = await signToken(user);

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

  const likers = await Promise.all(
    Array.from({ length: 3 }, () => createUser('vliker'))
  );

  const likes = await Promise.all(
    likers.map((liker) =>
      Like.create({
        userId: liker.id,
        targetType: 'Video',
        targetId: video.id,
      })
    )
  );

  try {
    const response = await fetch(
      `${baseUrl}/api/uservideolibrary?page=1&limit=30&sortKey=dateDesc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    assert.equal(response.status, 200);
    const body = await response.json();

    const found = body.videos.find((v) => v.id === video.id);
    assert.ok(found, 'Видео должно быть в библиотеке');
    assert.equal(found.likesCount, 3, 'Точный счётчик');
    assert.equal(found.isLiked, false, 'Пользователь не лайкал');
    assert.equal(found.likes, undefined, 'Массив likes не возвращается');
  } finally {
    for (const l of likes) await l.destroy();
    for (const liker of likers) await liker.destroy();
    await library.destroy();
    await video.destroy();
    await user.destroy();
  }
});
