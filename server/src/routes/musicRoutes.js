const { Router } = require('express');
const musicController = require('../controllers/musicController');
const {
  validateIdParam,
  validateMusic,
} = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const musicRoutes = Router();

// Публичная лента и поиск (объединено)
musicRoutes.get('/', authMiddleware, musicController.getMusic);

// Библиотека конкретного пользователя
musicRoutes.get(
  '/profile/:userId',
  validateIdParam('userId'),
  authMiddleware,
  musicController.getUserMusic
);

// Получение одного трека по ID
musicRoutes.get(
  '/:trackId',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.getMusicById
);

// Загрузка медиа файла для трека
musicRoutes.post(
  '/upload-audio',
  authMiddleware,
  upload.single('audio'),
  handleUploadError,
  musicController.uploadAudio
);

// Загрузка обложки для трека
musicRoutes.post(
  '/upload-cover',
  authMiddleware,
  upload.single('cover'),
  handleUploadError,
  musicController.uploadCover
);

// Создание трека
musicRoutes.post(
  '/',
  authMiddleware,
  validateMusic,
  musicController.createMusic
);

// Обновление метаданных трека (владелец)
musicRoutes.put(
  '/:trackId',
  validateIdParam('trackId'),
  authMiddleware,
  validateMusic,
  musicController.updateMusic
);

// Инкремент счетчика прослушиваний
musicRoutes.put(
  '/:trackId/play',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.incrementPlayCount
);

// Обновление приватности треков
musicRoutes.put('/privacy', authMiddleware, musicController.updateMusicPrivacy);

// Удаление трека (владелец)
musicRoutes.delete(
  '/:trackId',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.deleteMusic
);

module.exports = musicRoutes;
