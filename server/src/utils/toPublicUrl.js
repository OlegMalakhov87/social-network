const path = require('node:path');
const { MEDIA_ROOT } = require('../../config/mediaUploadConfig');
const { createError } = require('./createError');

/**
 * Преобразует абсолютный путь к файлу в публичный URL.
 *
 * @param {string} filePath - Абсолютный путь к файлу
 * @returns {string|null} Публичный URL
 */
const toPublicUrl = (filePath) => {
  if (!filePath) {
    return null;
  }

  const absolutePath = path.resolve(filePath);
  const mediaRoot = path.resolve(MEDIA_ROOT);

  const relativePath = path.relative(mediaRoot, absolutePath);

  if (
    !relativePath ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw createError(
      'Путь файла находится вне директории uploads',
      400,
      'INVALID_MEDIA_PATH'
    );
  }

  return `/uploads/${relativePath.split(path.sep).join('/')}`;
};

module.exports = { toPublicUrl };
