const path = require('path');
const { MEDIA_ROOT } = require('../../config/mediaCleanupConfig');

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

  if (
    absolutePath !== mediaRoot &&
    !absolutePath.startsWith(`${mediaRoot}${path.sep}`)
  ) {
    throw new Error('Media path outside uploads');
  }

  const relativePath = path.relative(mediaRoot, absolutePath);

  return `/uploads/${relativePath.replaceAll(path.sep, '/')}`;
};

module.exports = { toPublicUrl };
