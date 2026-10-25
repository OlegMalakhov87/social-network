const { createError } = require('./createError');

/**
 * Проверяет, что значение является непустой строкой.
 *
 * @param {*} value - Проверяемое значение
 * @returns {boolean} Признак непустой строки.
 */
const hasUrl = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * Проверяет согласованность типа медиа и ссылок на файлы.
 *
 * @param {Object} params - Поля медиа
 * @param {string} params.type - Тип медиа
 * @param {string|null} [params.mediaUrl] - URL основного файла
 * @param {string|null} [params.previewUrl] - URL превью
 * @param {string|null} [params.thumbnailUrl] - URL обложки
 * @returns {void} Ничего не возвращает.
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
