const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

const { sequelize, User, TemporaryMedia } = require('../../db/models');
const temporaryMediaService = require('../../src/services/temporaryMediaService');

const TEST_DATABASE = 'socialnet_test';

if (
  process.env.NODE_ENV !== 'test' ||
  sequelize.getDatabaseName() !== TEST_DATABASE
) {
  throw new Error('Интеграционные тесты разрешены только в socialnet_test');
}

after(async () => {
  await sequelize.close();
});

test('registerMany создаёт временную запись с корректным TTL', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const email = `media-test-${uniqueId}@example.com`;
  const url = `/uploads/test/avatar-${uniqueId}.png`;

  const passwordHash = await bcrypt.hash('test-password', 4);

  const user = await User.create({
    name: 'Test User',
    email,
    passwordHash,
  });

  try {
    const beforeRegistration = Date.now();

    const records = await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    const afterRegistration = Date.now();

    assert.equal(records.length, 1);

    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.ok(media, 'Временная запись должна существовать');

    assert.equal(media.userId, user.id);
    assert.equal(media.url, url);
    assert.equal(media.mediaType, 'image');
    assert.equal(media.fieldName, 'avatarUrl');

    const ttl = 24 * 60 * 60 * 1000;
    const expiresAt = media.expiresAt.getTime();

    assert.ok(
      expiresAt >= beforeRegistration + ttl,
      'Срок действия не должен быть раньше ожидаемого'
    );

    assert.ok(
      expiresAt <= afterRegistration + ttl,
      'Срок действия не должен быть позже ожидаемого'
    );
  } finally {
    await user.destroy();
  }
});

test('commitMany сохраняет временную запись при откате транзакции', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/rollback-${uniqueId}.png`;

  const user = await User.create({
    name: 'Rollback Test User',
    email: `rollback-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    await assert.rejects(
      sequelize.transaction(async (transaction) => {
        await temporaryMediaService.commitMany(
          user.id,
          [{ url, fieldName: 'avatarUrl' }],
          { transaction }
        );

        // Имитируем ошибку обновления профиля.
        throw new Error('PROFILE_UPDATE_FAILED');
      }),
      /PROFILE_UPDATE_FAILED/
    );

    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.ok(
      media,
      'После отката транзакции временная запись должна сохраниться'
    );

    assert.equal(media.userId, user.id);
    assert.equal(media.fieldName, 'avatarUrl');
  } finally {
    await user.destroy();
  }
});

test('commitMany запрещает фиксировать чужой медиафайл', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/ownership-${uniqueId}.png`;
  const passwordHash = await bcrypt.hash('test-password', 4);

  const owner = await User.create({
    name: 'Media Owner',
    email: `owner-${uniqueId}@example.com`,
    passwordHash,
  });

  let anotherUser;

  try {
    anotherUser = await User.create({
      name: 'Another User',
      email: `another-${uniqueId}@example.com`,
      passwordHash,
    });

    await temporaryMediaService.registerMany([
      {
        userId: owner.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    await assert.rejects(
      temporaryMediaService.commitMany(anotherUser.id, [
        { url, fieldName: 'avatarUrl' },
      ]),
      (error) => {
        assert.equal(error.statusCode, 403);
        assert.equal(error.code, 'TEMPORARY_MEDIA_FORBIDDEN');
        return true;
      }
    );

    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.ok(media, 'Чужая временная запись не должна удаляться');

    assert.equal(media.userId, owner.id);
  } finally {
    if (anotherUser) {
      await anotherUser.destroy();
    }

    await owner.destroy();
  }
});

test('commitMany запрещает фиксировать просроченный медиафайл', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/expired-${uniqueId}.png`;

  const user = await User.create({
    name: 'Expired Media Test User',
    email: `expired-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    // ARRANGE: регистрируем временный файл.
    await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    // Искусственно устанавливаем срок действия в прошлом.
    const expiredAt = new Date(Date.now() - 60_000);

    await TemporaryMedia.update({ expiresAt: expiredAt }, { where: { url } });

    // ACT + ASSERT: попытка фиксации должна завершиться ошибкой.
    await assert.rejects(
      temporaryMediaService.commitMany(user.id, [
        { url, fieldName: 'avatarUrl' },
      ]),
      {
        statusCode: 410,
        code: 'TEMPORARY_MEDIA_EXPIRED',
      }
    );

    // ASSERT: запись не должна быть удалена.
    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.ok(
      media,
      'Просроченная временная запись должна сохраниться после отказа'
    );

    assert.equal(media.userId, user.id);
    assert.equal(media.expiresAt.getTime(), expiredAt.getTime());
  } finally {
    await user.destroy();
  }
});

test('commitMany запрещает использовать медиафайл с другим fieldName', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/field-${uniqueId}.png`;

  const user = await User.create({
    name: 'Field Name Test User',
    email: `field-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    // ARRANGE: файл зарегистрирован для аватара.
    await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    // ACT + ASSERT: пробуем использовать его для другого поля.
    await assert.rejects(
      temporaryMediaService.commitMany(user.id, [
        { url, fieldName: 'postImage' },
      ]),
      {
        statusCode: 403,
        code: 'TEMPORARY_MEDIA_FORBIDDEN',
      }
    );

    // ASSERT: запись владельца должна сохраниться.
    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.ok(media);
    assert.equal(media.userId, user.id);
    assert.equal(media.fieldName, 'avatarUrl');
  } finally {
    await user.destroy();
  }
});

test('commitMany отклоняет медиафайл без fieldName', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/missing-field-${uniqueId}.png`;

  const user = await User.create({
    name: 'Missing Field Test User',
    email: `missing-field-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    await assert.rejects(temporaryMediaService.commitMany(user.id, [{ url }]), {
      statusCode: 400,
      code: 'INVALID_TEMPORARY_MEDIA',
    });

    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.ok(media);
    assert.equal(media.fieldName, 'avatarUrl');
  } finally {
    await user.destroy();
  }
});

test('commitMany удаляет временную запись после успешной фиксации', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/commit-${uniqueId}.png`;

  const user = await User.create({
    name: 'Commit Media Test User',
    email: `commit-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    // ARRANGE: регистрируем временный файл.
    await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    // ACT: успешно фиксируем файл.
    const committedRecords = await temporaryMediaService.commitMany(user.id, [
      { url, fieldName: 'avatarUrl' },
    ]);

    // ASSERT: сервис вернул обработанную запись.
    assert.equal(committedRecords.length, 1);
    assert.equal(committedRecords[0].url, url);

    // ASSERT: временная запись удалена из базы.
    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.equal(media, null);
  } finally {
    await user.destroy();
  }
});

test('removeMany удаляет временный медиафайл пользователя', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/remove-${uniqueId}.png`;

  const user = await User.create({
    name: 'Remove Media Test User',
    email: `remove-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    // ARRANGE: регистрируем временный файл.
    await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    // ACT: отменяем временную загрузку.
    const result = await temporaryMediaService.removeMany(user.id, [
      { url, fieldName: 'avatarUrl' },
    ]);

    // ASSERT: метод сообщил об удалении одной записи.
    assert.equal(result.deleted, 1);

    // ASSERT: запись действительно отсутствует в PostgreSQL.
    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.equal(media, null);
  } finally {
    await user.destroy();
  }
});

test('removeMany не удаляет чужой временный медиафайл', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;
  const url = `/uploads/test/foreign-remove-${uniqueId}.png`;

  const owner = await User.create({
    name: 'Media Owner',
    email: `remove-owner-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  let anotherUser;

  try {
    anotherUser = await User.create({
      name: 'Another User',
      email: `remove-other-${uniqueId}@example.com`,
      passwordHash: await bcrypt.hash('test-password', 4),
    });
    // ARRANGE: файл принадлежит owner.
    await temporaryMediaService.registerMany([
      {
        userId: owner.id,
        url,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    // ACT: другой пользователь пытается удалить файл.
    const result = await temporaryMediaService.removeMany(anotherUser.id, [
      { url, fieldName: 'avatarUrl' },
    ]);

    // ASSERT: ни одна запись не удалена.
    assert.equal(result.deleted, 0);

    // ASSERT: файл по-прежнему принадлежит владельцу.
    const media = await TemporaryMedia.findOne({
      where: { url },
    });

    assert.ok(media);
    assert.equal(media.userId, owner.id);
    assert.equal(media.fieldName, 'avatarUrl');
  } finally {
    if (anotherUser) {
      await anotherUser.destroy();
    }
    await owner.destroy();
  }
});

test('cleanupExpired удаляет просроченные записи и сохраняет действующие', async () => {
  const uniqueId = `${Date.now()}-${process.pid}`;

  const expiredUrl = `/uploads/test/cleanup-expired-${uniqueId}.png`;
  const activeUrl = `/uploads/test/cleanup-active-${uniqueId}.png`;

  const user = await User.create({
    name: 'Cleanup Test User',
    email: `cleanup-${uniqueId}@example.com`,
    passwordHash: await bcrypt.hash('test-password', 4),
  });

  try {
    // ARRANGE: создаём два временных медиафайла.
    await temporaryMediaService.registerMany([
      {
        userId: user.id,
        url: expiredUrl,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
      {
        userId: user.id,
        url: activeUrl,
        mediaType: 'image',
        fieldName: 'avatarUrl',
      },
    ]);

    // Делаем просроченным только первый файл.
    await TemporaryMedia.update(
      { expiresAt: new Date(Date.now() - 60_000) },
      { where: { url: expiredUrl } }
    );

    // ACT: запускаем очистку.
    await temporaryMediaService.cleanupExpired();

    // ASSERT: просроченная запись удалена.
    const expiredMedia = await TemporaryMedia.findOne({
      where: { url: expiredUrl },
    });

    assert.equal(expiredMedia, null);

    // ASSERT: действующая запись сохранена.
    const activeMedia = await TemporaryMedia.findOne({
      where: { url: activeUrl },
    });

    assert.ok(activeMedia);
    assert.equal(activeMedia.userId, user.id);
  } finally {
    await user.destroy();
  }
});
