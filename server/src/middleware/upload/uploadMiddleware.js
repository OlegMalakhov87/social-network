const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const {
  STAGING_ROOT,
  UPLOAD_MIME_CONFIG,
} = require('../../../config/mediaUploadConfig');
const { createError } = require('../../utils/createError');

/** Хранение файлов на диске */
const storage = multer.diskStorage({
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

  filename: (req, file, cb) => {
    cb(null, randomUUID());
  },
});

/** Фильтрация файлов */
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

/** Загрузка файлов */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB — макс. размер одного файла
    files: 5, // макс. количество файлов в одном запросе
    fields: 10, // макс. количество текстовых полей (не файлов) в multipart-форме
    parts: 15, // макс. общее количество частей (файлы + поля) в multipart-форме
  },
});

/** Обработка ошибок загрузки файлов */
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
