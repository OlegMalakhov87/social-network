const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MEDIA_ROOT } = require('../../../config/mediaCleanupConfig');
const { createError } = require('../../utils/createError');

/** Гарантируем, что папки существуют при запуске */
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/** Получение пути для загрузки файла */
const getDestination = (fieldName, mimetype) => {
  const base = MEDIA_ROOT;

  if (fieldName === 'avatarUrl') return path.join(base, 'avatars');
  if (fieldName === 'thumbnailUrl') return path.join(base, 'videos/thumbnails');
  if (fieldName === 'coverUrl') return path.join(base, 'music/covers');
  if (fieldName === 'postUrl' && mimetype.startsWith('image/'))
    return path.join(base, 'posts/images');
  if (fieldName === 'postUrl' && mimetype.startsWith('video/'))
    return path.join(base, 'posts/videos');
  if (fieldName === 'newsUrl' && mimetype.startsWith('image/'))
    return path.join(base, 'news/images');
  if (fieldName === 'newsUrl' && mimetype.startsWith('video/'))
    return path.join(base, 'news/videos');
  if (fieldName === 'videoUrl') return path.join(base, 'videos/video');
  if (fieldName === 'previewUrl') return path.join(base, 'videos/previews');
  if (fieldName === 'audioUrl') return path.join(base, 'music/tracks');

  throw createError(
    `Недопустимый путь загрузки: ${fieldName} (${mimetype})`,
    400,
    'UNSUPPORTED_UPLOAD_DESTINATION'
  );
};
/** Хранение файлов на диске */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = getDestination(file.fieldname, file.mimetype);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

/** Фильтрация файлов */
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg',
    'image/jfif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/flac',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      createError('Неподдерживаемый тип файла', 400, 'UNSUPPORTED_FILE_TYPE'),
      false
    );
  }
};

/** Загрузка файлов */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 },
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
    return res.status(400).json({ error: err.message, code: 'MULTER_ERROR' });
  }
  next(err);
};

module.exports = {
  upload,
  handleUploadError,
};
