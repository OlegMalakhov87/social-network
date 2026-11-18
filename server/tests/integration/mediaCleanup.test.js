const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');

const { sequelize, User, Music } = require('../../db/models');
const mediaCleanupService = require('../../src/services/mediaCleanupService');
const { MEDIA_ROOT } = require('../../config/mediaUploadConfig');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

after(async () => {
  await sequelize.close();
});

test('collectUsedFiles пропускает нераспознанные URL и считает их', async () => {
  const user = await User.create({
    name: `cleanup-test-${randomUUID()}`,
    email: `test-${randomUUID().replaceAll('-', '')}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  const track = await Music.create({
    uploadedBy: user.id,
    title: 'cleanup test',
    artist: 'test',
    size: 2048,
    audioUrl: `/uploads/music/tracks/valid-${randomUUID()}.mp3`,
    coverUrl: 'https://external.example.com/cover.jpg', // нераспознанный
    category: 'other',
    isPublic: true,
    playsCount: 0,
  });

  try {
    const { usedFiles, unparsed } =
      await mediaCleanupService.collectUsedFiles();

    assert.ok(unparsed >= 1, 'Должен быть хотя бы 1 нераспознанный URL');
    assert.ok(
      usedFiles.has(
        path.resolve(MEDIA_ROOT, track.audioUrl.slice('/uploads/'.length))
      ),
      'Валидный URL должен попасть в usedFiles'
    );
  } finally {
    await track.destroy();
    await user.destroy();
  }
});
