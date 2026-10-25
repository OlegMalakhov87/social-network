const path = require('node:path');

const { MEDIA_ROOT } = require('../../config/mediaUploadConfig');
const { createError } = require('./createError');

const MEDIA_URL_PREFIX = '/uploads/';

/**
 * Преобразует публичный URL в абсолютный путь к файлу.
 *
 * @param {string} url - Публичный URL
 * @returns {string|null} Абсолютный путь к файлу или null, если URL пуст.
 */
const fromPublicUrl = (url) => {
  if (!url) return null;

  if (typeof url !== 'string') {
    throw createError('Некорректный тип URL', 400, 'INVALID_URL_TYPE');
  }

  // Старые записи хранят путь без начального слеша.
  const normalizedUrl = url.startsWith('/') ? url : '/' + url;

  if (!normalizedUrl.startsWith(MEDIA_URL_PREFIX)) {
    throw createError('Некорректный путь URL', 400, 'INVALID_MEDIA_PATH');
  }

  const relativePath = normalizedUrl.slice(MEDIA_URL_PREFIX.length);

  if (
    !relativePath ||
    relativePath.includes('\\') ||
    relativePath.includes('?') ||
    relativePath.includes('#') ||
    relativePath.includes('%') ||
    relativePath.includes('\0')
  ) {
    throw createError('Недопустимые символы в URL', 400, 'INVALID_MEDIA_URL');
  }

  const segments = relativePath.split('/');

  if (
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw createError('Некорректные сегменты пути', 400, 'INVALID_MEDIA_URL');
  }

  const mediaRoot = path.resolve(MEDIA_ROOT);
  const filePath = path.resolve(mediaRoot, ...segments);

  const relative = path.relative(mediaRoot, filePath);

  if (
    !relative ||
    relative === '..' ||
    relative.startsWith('..' + path.sep) ||
    path.isAbsolute(relative)
  ) {
    throw createError(
      'Путь выходит за пределы директории медиа',
      400,
      'INVALID_MEDIA_URL'
    );
  }

  return filePath;
};

module.exports = { fromPublicUrl };
