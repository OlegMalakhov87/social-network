const { createError } = require('./createError');

/**
 * Проверяет, является ли значение строкой и не пустой
 * @param {string} value - значение для проверки
 * @returns {boolean} - true, если значение является строкой и не пустой, false в противном случае
 */
const hasUrl = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * Проверяет, являются ли медиафайлы валидными
 * @param {Object} params - параметры для проверки
 * @param {string} params.type - тип медиа
 * @param {string} params.mediaUrl - URL медиа
 * @param {string} params.previewUrl - URL превью
 * @param {string} params.thumbnailUrl - URL обложки
 */
const validateMedia = ({ type, mediaUrl, previewUrl, thumbnailUrl }) => {
  if (type === 'text') {
    if (mediaUrl != null || previewUrl != null || thumbnailUrl != null) {
      throw createError(
        'Текстовая тип медиа не должен содержать медиафайлы',
        400,
        'INVALID_MEDIA_MEDIA'
      );
    }
    return;
  }

  if (type === 'image') {
    if (!hasUrl(mediaUrl) || previewUrl != null || thumbnailUrl != null) {
      throw createError(
        'Для типа медиа с изображением требуется только изображение',
        400,
        'INVALID_MEDIA_MEDIA'
      );
    }
    return;
  }

  if (type === 'video') {
    if (!hasUrl(mediaUrl) || !hasUrl(previewUrl) || !hasUrl(thumbnailUrl)) {
      throw createError(
        'Для типа видео медиа необходимы видео, превью и обложка',
        400,
        'INVALID_MEDIA_MEDIA'
      );
    }
    return;
  }

  throw createError('Некорректный тип медиа', 400, 'INVALID_MEDIA_TYPE');
};

module.exports = { validateMedia };
