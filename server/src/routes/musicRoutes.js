const { Router } = require('express');

const musicController = require('../controllers/musicController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const {
  validateCreateTrack,
} = require('../middleware/validation/validateCreateTrack');
const {
  validateUpdateTrack,
} = require('../middleware/validation/validateUpdateTrack');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  validatePrivacyUpdate,
} = require('../middleware/validation/validatePrivacyUpdate');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');
const {
  validateUploadedMedia,
} = require('../middleware/validation/validateUploadedMedia');

const musicRoutes = Router();

// Возвращает публичную ленту и результат поиска.
musicRoutes.get('/', authMiddleware, musicController.getMusic);

// Создает трек.
musicRoutes.post(
  '/add',
  authMiddleware,
  validateCreateTrack,
  musicController.createMusic
);

// Загружает аудиофайл.
musicRoutes.post(
  '/upload-audio',
  authMiddleware,
  upload.single('audioUrl'),
  handleUploadError,
  validateUploadedMedia,
  musicController.uploadAudio
);

// Загружает обложку трека.
musicRoutes.post(
  '/upload-cover',
  authMiddleware,
  upload.single('coverUrl'),
  handleUploadError,
  validateUploadedMedia,
  musicController.uploadCover
);

// Обновляет трек владельца.
musicRoutes.put(
  '/:trackId/update',
  validateIdParam('trackId'),
  authMiddleware,
  validateUpdateTrack,
  musicController.updateMusic
);

// Обновляет приватность треков.
musicRoutes.patch(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  musicController.updateMusicPrivacy
);

// Увеличивает счетчик прослушиваний.
musicRoutes.patch(
  '/:trackId/plays',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.incrementPlaysCount
);

// Удаляет трек владельца.
musicRoutes.delete(
  '/:trackId/delete',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.deleteMusic
);

// Удаляет загруженные медиафайлы.
musicRoutes.delete(
  '/delete-uploaded-audio',
  authMiddleware,
  musicController.deleteUploadedMedia
);

// Удаляет загруженную обложку.
musicRoutes.delete(
  '/delete-uploaded-cover',
  authMiddleware,
  musicController.deleteUploadedCover
);

module.exports = musicRoutes;
