const fs = require('node:fs/promises');
const path = require('node:path');
const { constants } = require('node:fs');
const { randomUUID } = require('node:crypto');

const {
  MEDIA_ROOT,
  STAGING_ROOT,
  PUBLISH_STAGING_ROOT,
  UPLOAD_DESTINATIONS,
} = require('../../config/mediaUploadConfig');
const { createError } = require('../utils/createError');

/**
 * Публикует готовый файл в публичное хранилище.
 *
 * @param {string} sourcePath - Путь к исходному файлу
 * @param {string} destinationDir - Каталог назначения
 * @param {string} extension - Расширение файла
 * @returns {Promise<string>} Абсолютный путь опубликованного файла.
 */
async function publishFile(sourcePath, destinationDir, extension) {
  const filename = `${randomUUID()}${extension}`;

  const temporaryPath = path.join(PUBLISH_STAGING_ROOT, filename);
  const destinationPath = path.join(destinationDir, filename);

  let published = false;

  try {
    await fs.mkdir(destinationDir, { recursive: true });

    await fs.mkdir(PUBLISH_STAGING_ROOT, {
      recursive: true,
      mode: 0o700,
    });

    // Копирует в закрытую директорию на той же файловой системе.
    await fs.copyFile(sourcePath, temporaryPath, constants.COPYFILE_EXCL);

    // Атомарно публикует полностью готовый файл.
    await fs.link(temporaryPath, destinationPath);

    published = true;

    // Ошибки удаления временных файлов не отменяют публикацию.
    await fs.unlink(temporaryPath).catch((error) => {
      if (error.code !== 'ENOENT') {
        console.error('[MediaStorage] Ошибка очистки publish staging:', error);
      }
    });

    await fs.unlink(sourcePath).catch((error) => {
      if (error.code !== 'ENOENT') {
        console.error('[MediaStorage] Ошибка очистки исходного файла:', error);
      }
    });

    return destinationPath;
  } catch (error) {
    await fs.unlink(temporaryPath).catch((cleanupError) => {
      if (cleanupError.code !== 'ENOENT') {
        console.error(
          '[MediaStorage] Ошибка очистки временной копии:',
          cleanupError
        );
      }
    });

    if (published) {
      await fs.unlink(destinationPath).catch((cleanupError) => {
        if (cleanupError.code !== 'ENOENT') {
          console.error(
            '[MediaStorage] Ошибка отката публикации:',
            cleanupError
          );
        }
      });
    }

    throw error;
  }
}

/**
 * Проверка, что путь находится внутри корневой директории.
 *
 * @param {string} root - Абсолютный путь корневого каталога
 * @param {string} target - Проверяемый абсолютный путь
 * @returns {boolean} Признак пути внутри корневого каталога.
 */
const isInside = (root, target) => {
  const relative = path.relative(root, target);

  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
};

const mediaStorageService = {
  /**
   * Публикация медиа файла.
   *
   * @param {Object} file - Загруженный файл
   * @returns {Promise<string>} Путь к публикации файла.
   */
  async publish(file) {
    if (!file?.path || !file.mediaType || !file.safeExtension) {
      throw createError('Файл не прошёл проверку', 400, 'MEDIA_NOT_VALIDATED');
    }

    const sourcePath = path.resolve(file.path);

    if (!isInside(path.resolve(STAGING_ROOT), sourcePath)) {
      throw createError('Недопустимый путь к файлу', 400, 'INVALID_MEDIA_PATH');
    }

    const config = UPLOAD_DESTINATIONS[file.fieldname];

    const relativeDir =
      typeof config === 'string' ? config : config?.[file.mediaType];

    if (!relativeDir) {
      throw createError(
        'Неизвестное назначение файла',
        400,
        'INVALID_MEDIA_DESTINATION'
      );
    }

    const destinationDir = path.resolve(MEDIA_ROOT, relativeDir);

    if (!isInside(path.resolve(MEDIA_ROOT), destinationDir)) {
      throw createError(
        'Недопустимая директория назначения',
        400,
        'INVALID_MEDIA_DESTINATION'
      );
    }

    const destinationPath = await publishFile(
      sourcePath,
      destinationDir,
      file.safeExtension
    );

    file.path = destinationPath;
    file.filename = path.basename(destinationPath);
    file.destination = destinationDir;

    return destinationPath;
  },

  /**
   * Публикует файл, сгенерированный сервером.
   *
   * @param {string} sourcePath - Путь к исходному файлу
   * @param {'preview'|'thumbnail'} type - Тип файла
   * @returns {Promise<string>} Абсолютный путь опубликованного файла.
   */
  async publishGeneratedFile(sourcePath, type) {
    const destinations = {
      preview: {
        directory: 'videos/previews',
        extension: '.mp4',
      },
      thumbnail: {
        directory: 'videos/thumbnails',
        extension: '.jpg',
      },
    };

    const destination = destinations[type];

    if (!destination) {
      throw createError(
        'Неподдерживаемый тип производного файла',
        400,
        'INVALID_GENERATED_MEDIA_TYPE'
      );
    }

    if (typeof sourcePath !== 'string' || !sourcePath) {
      throw createError(
        'Путь к файлу не указан',
        400,
        'GENERATED_FILE_PATH_REQUIRED'
      );
    }

    const absoluteSourcePath = path.resolve(sourcePath);

    if (!isInside(path.resolve(STAGING_ROOT), absoluteSourcePath)) {
      throw createError(
        'Файл находится вне разрешённой staging-директории',
        400,
        'INVALID_GENERATED_FILE_PATH'
      );
    }

    const destinationDir = path.resolve(MEDIA_ROOT, destination.directory);

    if (!isInside(path.resolve(MEDIA_ROOT), destinationDir)) {
      throw createError(
        'Недопустимая директория назначения',
        400,
        'INVALID_MEDIA_DESTINATION'
      );
    }

    return publishFile(
      absoluteSourcePath,
      destinationDir,
      destination.extension
    );
  },
};

module.exports = mediaStorageService;
