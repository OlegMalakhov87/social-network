const fs = require('node:fs/promises');

const mediaService = require('./mediaService');
const mediaStorageService = require('./mediaStorageService');
const temporaryMediaService = require('./temporaryMediaService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

/**
 * Проверяет длительность видеофайла.
 *
 * @param {string} filePath - Путь к staging-файлу
 * @param {number} maxDuration - Максимально допустимая длительность (в секундах)
 * @param {string} errorMessage - Текст ошибки
 * @param {string} errorCode - Машинный код ошибки
 * @returns {Promise<Object>} Метаданные файла (duration, size).
 */
const validateVideoDuration = async (
  filePath,
  maxDuration,
  errorMessage,
  errorCode
) => {
  const metadata = await mediaService.getMetadata(filePath, 'video');

  if (
    !Number.isFinite(metadata.duration) ||
    metadata.duration <= 0 ||
    metadata.duration > maxDuration
  ) {
    throw createError(errorMessage, 400, errorCode);
  }

  return metadata;
};

/**
 * Публикует загруженный файл и регистрирует его как временный.
 *
 * @param {Object} file - Загруженный файл (req.file)
 * @param {number} userId - Идентификатор пользователя
 * @param {Object} options - Настройки пайплайна
 * @param {string} options.fieldName - Имя поля в TemporaryMedia и в ответе
 * @param {string[]} options.allowedTypes - Разрешённые mediaType ('image', 'video')
 * @param {number} [options.maxDuration] - Максимальная длительность видео (секунды)
 * @param {string} [options.durationError] - Текст ошибки для превышения длительности
 * @param {string} [options.durationErrorCode] - Код ошибки для превышения длительности
 * @returns {Promise<Object>} Объект с публичным URL по ключу fieldName.
 */
const runUploadPipeline = async (file, userId, options) => {
  const {
    fieldName,
    allowedTypes,
    maxDuration,
    durationError = 'Длительность файла превышает допустимую',
    durationErrorCode = 'DURATION_EXCEEDED',
  } = options;

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
    // Проверка длительности — только для видео и только если задан лимит.
    // Работает на staging-пути, до публикации.
    if (mediaType === 'video' && typeof maxDuration === 'number') {
      await validateVideoDuration(
        stagingPath,
        maxDuration,
        durationError,
        durationErrorCode
      );
    }

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
