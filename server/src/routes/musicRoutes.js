const { Router } = require('express');
const musicController = require('../controllers/musicController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { validateMusic } = require('../middleware/validation/musicValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  validatePrivacyUpdate,
} = require('../middleware/validation/validatePrivacyUpdate');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');

const musicRoutes = Router();

// Публичная лента и поиск (объединено)
musicRoutes.get('/', authMiddleware, musicController.getMusic);

// Загрузка аудио файла 
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

// Обновление трека (владелец)
musicRoutes.put(
  '/:trackId/update',
  validateIdParam('trackId'),
  authMiddleware,
  validateMusic,
  musicController.updateMusic
);

// Обновление приватности треков
musicRoutes.put(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  musicController.updateMusicPrivacy
);

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

// Удаление (очистка мусора) загруженных медиа файлов
musicRoutes.delete(
  '/delete-uploaded-audio',
  authMiddleware,
  musicController.deleteUploadedMedia
);

// Удаление загруженных медиа обложек
musicRoutes.delete(
  '/delete-uploaded-cover',
  authMiddleware,
  musicController.deleteUploadedCover
);

module.exports = musicRoutes;
