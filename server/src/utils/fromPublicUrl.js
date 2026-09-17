const path = require('path');
const { MEDIA_ROOT } = require('../../config/mediaCleanupConfig');
const { createError } = require('./createError');

/**
 * Преобразует публичный URL в абсолютный путь к файлу.
 *
 * @param {string} url - Публичный URL
 * @returns {string|null} Абсолютный путь к файлу
 */
const fromPublicUrl = (url) => {
  if (!url) return null;

  if (typeof url !== 'string') {
    throw createError('Некорректный тип URL', 400, 'INVALID_URL_TYPE');
  }

  const relativePath = url.replace(/^\/+/, '');

  if (!relativePath.startsWith('uploads/')) {
    throw createError('Некорректный путь URL', 400, 'INVALID_MEDIA_PATH');
  }

  const relativeMediaPath = relativePath.slice('uploads/'.length);

  const filePath = path.resolve(MEDIA_ROOT, relativeMediaPath);
  const mediaRoot = path.resolve(MEDIA_ROOT);

  if (
    filePath !== mediaRoot &&
    !filePath.startsWith(`${mediaRoot}${path.sep}`)
  ) {
    throw createError(
      'Некорректно сформированный URL',
      400,
      'INVALID_MEDIA_URL'
    );
  }

  return filePath;
};

module.exports = { fromPublicUrl };
