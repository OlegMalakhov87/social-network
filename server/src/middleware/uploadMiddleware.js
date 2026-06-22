const multer = require('multer');
const path = require('path');

// Настройка хранилища
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath += 'audio/';
    } else {
      uploadPath += 'other/';
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp3'],
  };

  if (file.mimetype.startsWith('image/') && allowedTypes.image.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video/') && allowedTypes.video.includes(file.mimetype)) {
    cb(null, true);
  } else if (file.mimetype.startsWith('audio/') && allowedTypes.audio.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый тип файла'), false);
  }
};

// Лимиты
const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB
  files: 5, // максимум 5 файлов за раз
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Middleware для обработки ошибок загрузки
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой (макс. 100MB)' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Слишком много файлов (макс. 5)' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

module.exports = {
  upload,
  handleUploadError,
};
