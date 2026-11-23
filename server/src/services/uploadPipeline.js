const fs = require('node:fs/promises');

const mediaService = require('./mediaService');
const mediaStorageService = require('./mediaStorageService');
const videoPreviewService = require('./videoPreviewService');
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
 * @param {string} options.fieldName - Имя поля основного файла в ответе
 * @param {string[]} options.allowedTypes - Разрешённые mediaType ('image', 'video')
 * @param {number} [options.maxDuration] - Максимальная длительность видео (секунды)
 * @param {string} [options.durationError] - Текст ошибки для превышения длительности
 * @param {string} [options.durationErrorCode] - Код ошибки для превышения длительности
 * @param {boolean} [options.generateDerived=false] - Генерировать preview и thumbnail для видео
 * @param {boolean} [options.withMetadata=false] - Возвращать duration и size в ответе
 * @returns {Promise<Object>} Объект с публичными URL и (опционально) метаданными.
 */
const runUploadPipeline = async (file, userId, options) => {
  const {
    fieldName,
    allowedTypes,
    maxDuration,
    durationError = 'Длительность файла превышает допустимую',
    durationErrorCode = 'DURATION_EXCEEDED',
    generateDerived = false,
    withMetadata = false,
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
    let videoMetadata = null;
    if (mediaType === 'video' && typeof maxDuration === 'number') {
      videoMetadata = await validateVideoDuration(
        stagingPath,
        maxDuration,
        durationError,
        durationErrorCode
      );
    }

    const mediaPath = await mediaStorageService.publish(file);
    createdFiles.push(mediaPath);

    const url = toPublicUrl(mediaPath);
    const result = { [fieldName]: url };
    const mediaToRegister = [{ userId, url, mediaType, fieldName }];

    // Derived файлы (preview + thumbnail) — только для видео.
    if (generateDerived) {
      if (mediaType === 'video') {
        // Если metadata не получена на этапе валидации — читаем с диска.
        if (!videoMetadata) {
          videoMetadata = await mediaService.getMetadata(mediaPath, 'video');
        }

        const previewPath = await videoPreviewService.generatePreview(
          mediaPath,
          videoMetadata.duration
        );
        createdFiles.push(previewPath);

        const thumbnailPath = await videoPreviewService.generateThumbnail(
          mediaPath,
          videoMetadata.duration
        );
        createdFiles.push(thumbnailPath);

        const previewUrl = toPublicUrl(previewPath);
        const thumbnailUrl = toPublicUrl(thumbnailPath);

        result.previewUrl = previewUrl;
        result.thumbnailUrl = thumbnailUrl;

        mediaToRegister.push(
          {
            userId,
            url: previewUrl,
            mediaType: 'video',
            fieldName: 'previewUrl',
          },
          {
            userId,
            url: thumbnailUrl,
            mediaType: 'image',
            fieldName: 'thumbnailUrl',
          }
        );
      } else {
        // Для картинки derived-файлов нет, но клиент ожидает поля.
        result.previewUrl = null;
        result.thumbnailUrl = null;
      }
    }

    await temporaryMediaService.registerMany(mediaToRegister);
    registered = true;

    if (withMetadata && videoMetadata) {
      result.duration = Math.max(1, Math.round(videoMetadata.duration));
      result.size = Math.max(1024, Math.round(videoMetadata.size));
    }

    return result;
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
