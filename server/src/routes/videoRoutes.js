const { Router } = require('express');
const videoController = require('../controllers/videoController');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const {
  validateCreateVideo,
} = require('../middleware/validation/validateCreateVideo');
const {
  validateUpdateVideo,
} = require('../middleware/validation/validateUpdateVideo');
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

const videoRoutes = Router();

// Публичная лента и поиск (объединено)
videoRoutes.get('/', authMiddleware, videoController.getVideos);

// Создание видео
videoRoutes.post(
  '/add',
  authMiddleware,
  validateCreateVideo,
  videoController.createVideo
);

// Загрузка видео файла
videoRoutes.post(
  '/upload-video',
  authMiddleware,
  upload.single('videoUrl'),
  handleUploadError,
  validateUploadedMedia,
  videoController.uploadVideo
);

// Загрузка обложки видео файла
videoRoutes.post(
  '/upload-thumbnail',
  authMiddleware,
  upload.single('thumbnailUrl'),
  handleUploadError,
  validateUploadedMedia,
  videoController.uploadThumbnail
);

// Загрузка превью видео файла
videoRoutes.post(
  '/upload-preview',
  authMiddleware,
  upload.single('previewUrl'),
  handleUploadError,
  validateUploadedMedia,
  videoController.uploadPreview
);

// Обновление видео (владелец)
videoRoutes.put(
  '/:videoId/update',
  validateIdParam('videoId'),
  authMiddleware,
  validateUpdateVideo,
  videoController.updateVideo
);

// Обновление приватности видео
videoRoutes.patch(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  videoController.updateVideoPrivacy
);

// Инкремент счетчика просмотров видео
videoRoutes.patch(
  '/:videoId/views',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.incrementViewsCount
);

// Удаление видео (владелец)
videoRoutes.delete(
  '/:videoId/delete',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.deleteVideo
);

// Удаление (очистка мусора) загруженных медиа файлов
videoRoutes.delete(
  '/delete-uploaded-video',
  authMiddleware,
  videoController.deleteUploadedMedia
);

// Удаление загруженных медиа превью
videoRoutes.delete(
  '/delete-uploaded-preview',
  authMiddleware,
  videoController.deleteUploadedPreview
);

// Удаление загруженных медиа thumbnail
videoRoutes.delete(
  '/delete-uploaded-thumb',
  authMiddleware,
  videoController.deleteUploadedThumbnail
);

module.exports = videoRoutes;
