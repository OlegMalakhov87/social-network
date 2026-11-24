const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const mediaStorageService = require('../../src/services/mediaStorageService');
const { STAGING_ROOT, MEDIA_ROOT } = require('../../config/mediaUploadConfig');
const { sequelize } = require('../../db/models');

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== 'socialnet_test'
) {
  throw new Error('Тесты разрешены только в socialnet_test');
}

after(async () => {
  await sequelize.close();
});

const createStagingFile = async (extension) => {
  const dir = path.join(STAGING_ROOT, 'generated');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `test-${randomUUID()}${extension}`);
  await fs.writeFile(filePath, 'fake-content');
  return filePath;
};

test('publishGeneratedFile: preview для posts попадает в posts/previews', async () => {
  const stagingPath = await createStagingFile('.mp4');

  try {
    const published = await mediaStorageService.publishGeneratedFile(
      stagingPath,
      'preview',
      'posts'
    );

    const expectedDir = path.resolve(MEDIA_ROOT, 'posts/previews');
    assert.ok(
      published.startsWith(expectedDir),
      `Ожидался путь в ${expectedDir}, получено: ${published}`
    );

    await fs.unlink(published);
  } catch (error) {
    await fs.unlink(stagingPath).catch(() => {});
    throw error;
  }
});

test('publishGeneratedFile: thumbnail для news попадает в news/thumbnails', async () => {
  const stagingPath = await createStagingFile('.jpg');

  try {
    const published = await mediaStorageService.publishGeneratedFile(
      stagingPath,
      'thumbnail',
      'news'
    );

    const expectedDir = path.resolve(MEDIA_ROOT, 'news/thumbnails');
    assert.ok(published.startsWith(expectedDir));

    await fs.unlink(published);
  } catch (error) {
    await fs.unlink(stagingPath).catch(() => {});
    throw error;
  }
});

test('publishGeneratedFile: без entity выбрасывает MISSING_ENTITY', async () => {
  const stagingPath = await createStagingFile('.mp4');

  try {
    await assert.rejects(
      () => mediaStorageService.publishGeneratedFile(stagingPath, 'preview'),
      (error) => error.code === 'MISSING_ENTITY'
    );
  } finally {
    await fs.unlink(stagingPath).catch(() => {});
  }
});
