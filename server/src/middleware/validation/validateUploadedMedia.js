const fs = require('node:fs/promises');
const sharp = require('sharp');
const { createError } = require('../../utils/createError');
const { UPLOAD_MIME_CONFIG } = require('../../../config/mediaUploadConfig');

/** Алиасы расширений файлов */
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/jfif': '.jfif',

  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',

  'audio/mpeg': '.mp3',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/flac': '.flac',
};

/** Алиасы MIME типов */
const MIME_ALIASES = {
  'image/jpg': 'image/jpeg',
  'image/jfif': 'image/jpeg',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/x-flac': 'audio/flac',
};

/** Нормализация MIME типа */
const normalizeMime = (mime) => MIME_ALIASES[mime] || mime;

/** Получение загруженных файлов */
const getUploadedFiles = (req) => [
  ...(req.file ? [req.file] : []),
  ...(Array.isArray(req.files)
    ? req.files
    : Object.values(req.files || {}).flat()),
];

/** Валидация загруженных медиа файлов */
const validateUploadedMedia = async (req, res, next) => {
  const files = getUploadedFiles(req);

  if (!files.length) return next();

  try {
    const { fileTypeFromFile } = await import('file-type');

    for (const file of files) {
      const detected = await fileTypeFromFile(file.path);

      /** Нормализация MIME типа */
      const detectedMime = normalizeMime(detected?.mime);

      /** Получение объявленного MIME типа */
      const declaredMime = normalizeMime(file.mimetype);

      /** Получение разрешенных MIME типов для поля загрузки */
      const allowedMimes = UPLOAD_MIME_CONFIG[file.fieldname] || [];

      if (
        !detectedMime ||
        detectedMime !== declaredMime ||
        !allowedMimes.includes(detectedMime)
      ) {
        throw createError(
          'Содержимое файла не соответствует разрешённому формату',
          400,
          'INVALID_FILE_CONTENT'
        );
      }

      /** Определение типа медиа файла */
      const mediaType = detectedMime.split('/')[0];

      /** Получение расширения файла */
      const extension = EXTENSIONS[detectedMime];

      /** Проверка типа медиа файла */
      if (!extension) {
        throw createError(
          'Неподдерживаемый формат файла',
          400,
          'UNSUPPORTED_MEDIA_FORMAT'
        );
      }

      /** Валидация изображений */
      if (mediaType === 'image') {
        try {
          await sharp(file.path, {
            animated: false,
            limitInputPixels: 40_000_000,
          })
            .rotate()
            .raw()
            .toBuffer();
        } catch {
          throw createError(
            'Изображение повреждено или слишком велико',
            400,
            'INVALID_IMAGE_FILE'
          );
        }
      }

      file.detectedMime = detectedMime;
      file.mediaType = mediaType;
      file.safeExtension = extension;
    }

    return next();
  } catch (error) {
    await Promise.allSettled(
      files.map(async (file) => {
        if (file.path) {
          await fs.unlink(file.path);
        }
      })
    );

    return next(error);
  }
};

module.exports = { validateUploadedMedia };
