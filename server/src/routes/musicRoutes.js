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

// Загрузка медиа файла для трека
musicRoutes.post(
  '/upload-audio',
  authMiddleware,
  upload.single('audioUrl'),
  handleUploadError,
  musicController.uploadAudio
);

// Загрузка обложки для трека
musicRoutes.post(
  '/upload-cover',
  authMiddleware,
  upload.single('coverUrl'),
  handleUploadError,
  musicController.uploadCover
);

// Создание трека
musicRoutes.post(
  '/add',
  authMiddleware,
  validateMusic,
  musicController.createMusic
);

// Обновление метаданных трека (владелец)
musicRoutes.put(
  '/:trackId/update',
  validateIdParam('trackId'),
  authMiddleware,
  validateMusic,
  musicController.updateMusic
);

// Обновление приватности треков
musicRoutes.put('/update-privacy', authMiddleware, musicController.updateMusicPrivacy);

// Инкремент счетчика прослушиваний
musicRoutes.put(
  '/:trackId/plays',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.incrementPlaysCount
);



// Удаление трека (владелец)
musicRoutes.delete(
  '/:trackId/delete',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.deleteMusic
);

module.exports = musicRoutes;
