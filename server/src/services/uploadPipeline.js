const fs = require('node:fs/promises');

const mediaService = require('./mediaService');
const mediaStorageService = require('./mediaStorageService');
const temporaryMediaService = require('./temporaryMediaService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

/**
 * Публикует загруженный файл и регистрирует его как временный.
 *
 * Унифицирует логику, чтобы не дублировать в 5 контроллерах.
 * На этом шаге поддерживает только базовую загрузку (publish + register).
 *
 * @param {Object} file - Загруженный файл (req.file)
 * @param {number} userId - Идентификатор пользователя
 * @param {Object} options - Настройки пайплайна
 * @param {string} options.fieldName - Имя поля в TemporaryMedia и в ответе
 * @param {string[]} options.allowedTypes - Разрешённые mediaType ('image', 'video')
 * @returns {Promise<Object>} Объект с публичным URL по ключу fieldName.
 */
const runUploadPipeline = async (file, userId, options) => {
  const { fieldName, allowedTypes } = options;

  if (!file) {
    throw createError('Файл не был загружен', 400, 'NO_FILE');
  }

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw createError(
      'Некорректный идентификатор пользователя',
      401,
      'INVALID_USER_ID'
    );
  }

  const mediaType = file.mediaType;

  if (!Array.isArray(allowedTypes) || !allowedTypes.includes(mediaType)) {
    throw createError(
      `Разрешены только: ${allowedTypes.join(', ')}`,
      400,
      'UNSUPPORTED_MEDIA_TYPE'
    );
  }

  // mediaStorageService.publish мутирует file.path,
  // поэтому stagingPath нужно запомнить до вызова.
  const stagingPath = file.path;
  const createdFiles = [];
  let registered = false;

  try {
    const mediaPath = await mediaStorageService.publish(file);
    createdFiles.push(mediaPath);

    const url = toPublicUrl(mediaPath);

    await temporaryMediaService.registerMany([
      {
        userId,
        url,
        mediaType,
        fieldName,
      },
    ]);
    registered = true;

    return { [fieldName]: url };
  } catch (error) {
    // Если публикация ещё не была зафиксирована в TemporaryMedia,
    // удаляем созданные файлы с диска.
    if (!registered && createdFiles.length > 0) {
      await Promise.allSettled(
        createdFiles.map(async (filePath) => {
          try {
            await fs.unlink(filePath);
          } catch (cleanupError) {
            if (cleanupError.code !== 'ENOENT') {
              console.error(
                '[UploadPipeline] Ошибка удаления файла:',
                cleanupError
              );
            }
          }
        })
      );
    }

    // Удаляем исходный staging-файл при любой ошибке.
    if (stagingPath) {
      try {
        await fs.unlink(stagingPath);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.error(
            '[UploadPipeline] Ошибка очистки staging:',
            cleanupError
          );
        }
      }
    }

    throw error;
  }
};

module.exports = { runUploadPipeline };
