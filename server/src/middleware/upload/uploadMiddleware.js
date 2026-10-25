const multer = require('multer');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');

const {
  STAGING_ROOT,
  UPLOAD_MIME_CONFIG,
} = require('../../../config/mediaUploadConfig');
const { createError } = require('../../utils/createError');

const storage = multer.diskStorage({
  /**
   * Создает закрытый каталог временных файлов и передает его multer.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {Express.Multer.File} file - Загружаемый файл
   * @param {Function} cb - Обратный вызов multer
   * @returns {void} Ничего не возвращает.
   */
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(STAGING_ROOT, {
        recursive: true,
        mode: 0o700,
      });

      cb(null, STAGING_ROOT);
    } catch (error) {
      cb(error);
    }
  },

  /**
   * Назначает файлу случайное имя без исходного расширения.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {Express.Multer.File} file - Загружаемый файл
   * @param {Function} cb - Обратный вызов multer
   * @returns {void} Ничего не возвращает.
   */
  filename: (req, file, cb) => {
    cb(null, randomUUID());
  },
});

/**
 * Проверяет поле загрузки и MIME-тип файла.
 *
 * @param {import('express').Request} req - Запрос Express
 * @param {Express.Multer.File} file - Загружаемый файл
 * @param {Function} cb - Обратный вызов multer
 * @returns {void} Ничего не возвращает.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = UPLOAD_MIME_CONFIG[file.fieldname];

  if (!allowedMimes) {
    return cb(
      createError(`Недопустимое поле загрузки`, 400, 'UNSUPPORTED_UPLOAD_FIELD')
    );
  }

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(
      createError(
        'Недопустимый MIME-тип для поля загрузки',
        400,
        'UNSUPPORTED_FILE_TYPE'
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // Ограничивает размер одного файла 200 МБ.
    files: 5, // Ограничивает число файлов в одном запросе.
    fields: 10, // Ограничивает число текстовых полей multipart-формы.
    parts: 15, // Ограничивает общее число частей multipart-формы.
  },
});

/**
 * Преобразует ошибку multer в ответ с кодом 400.
 *
 * @param {Error} err - Ошибка загрузки
 * @param {import('express').Request} req - Запрос Express
 * @param {import('express').Response} res - Ответ Express
 * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
 * @returns {void} Ничего не возвращает.
 */
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Файл слишком большой (макс. 200MB)',
        code: 'FILE_TOO_LARGE',
      });
    }

    return res.status(400).json({
      error: err.message,
      code: 'MULTER_ERROR',
    });
  }

  return next(err);
};

module.exports = {
  upload,
  handleUploadError,
};
