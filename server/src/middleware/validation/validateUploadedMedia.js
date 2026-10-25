const fs = require('node:fs/promises');
const sharp = require('sharp');

const { createError } = require('../../utils/createError');
const { UPLOAD_MIME_CONFIG } = require('../../../config/mediaUploadConfig');

/** Сопоставляет MIME-тип с расширением файла. */
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

/** Сопоставляет нестандартный MIME-тип с каноническим. */
const MIME_ALIASES = {
  'image/jpg': 'image/jpeg',
  'image/jfif': 'image/jpeg',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/x-flac': 'audio/flac',
};

/**
 * Приводит MIME-тип к каноническому значению.
 *
 * @param {string} mime - Объявленный или определенный MIME-тип
 * @returns {string} Канонический MIME-тип или исходное значение.
 */
const normalizeMime = (mime) => MIME_ALIASES[mime] || mime;

/**
 * Собирает файлы из одиночного и множественного поля загрузки.
 *
 * @param {import('express').Request} req - Запрос Express
 * @returns {Express.Multer.File[]} Загруженные файлы.
 */
const getUploadedFiles = (req) => [
  ...(req.file ? [req.file] : []),
  ...(Array.isArray(req.files)
    ? req.files
    : Object.values(req.files || {}).flat()),
];

/**
 * Проверяет содержимое загруженных файлов и удаляет их при ошибке.
 *
 * @param {import('express').Request} req - Запрос Express
 * @param {import('express').Response} res - Ответ Express
 * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
 * @returns {Promise<void>} Завершает операцию.
 */
const validateUploadedMedia = async (req, res, next) => {
  const files = getUploadedFiles(req);

  if (!files.length) return next();

  try {
    const { fileTypeFromFile } = await import('file-type');

    for (const file of files) {
      const detected = await fileTypeFromFile(file.path);

      const detectedMime = normalizeMime(detected?.mime);

      const declaredMime = normalizeMime(file.mimetype);

      // Подставляет пустой список как запасное значение, если поле загрузки не настроено.
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

      const mediaType = detectedMime.split('/')[0];

      const extension = EXTENSIONS[detectedMime];

      if (!extension) {
        throw createError(
          'Неподдерживаемый формат файла',
          400,
          'UNSUPPORTED_MEDIA_FORMAT'
        );
      }

      if (mediaType === 'image') {
        try {
          // Отключает анимацию и ограничивает число пикселей.
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
