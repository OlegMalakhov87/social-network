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

// Возвращает публичную ленту и результат поиска.
videoRoutes.get('/', authMiddleware, videoController.getVideos);

// Создает видео.
videoRoutes.post(
  '/add',
  authMiddleware,
  validateCreateVideo,
  videoController.createVideo
);

// Загружает видеофайл.
videoRoutes.post(
  '/upload-video',
  authMiddleware,
  upload.single('videoUrl'),
  handleUploadError,
  validateUploadedMedia,
  videoController.uploadVideo
);

// Загружает обложку видео.
videoRoutes.post(
  '/upload-thumbnail',
  authMiddleware,
  upload.single('thumbnailUrl'),
  handleUploadError,
  validateUploadedMedia,
  videoController.uploadThumbnail
);

// Загружает превью видео.
videoRoutes.post(
  '/upload-preview',
  authMiddleware,
  upload.single('previewUrl'),
  handleUploadError,
  validateUploadedMedia,
  videoController.uploadPreview
);

// Обновляет видео владельца.
videoRoutes.put(
  '/:videoId/update',
  validateIdParam('videoId'),
  authMiddleware,
  validateUpdateVideo,
  videoController.updateVideo
);

// Обновляет приватность видео.
videoRoutes.patch(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  videoController.updateVideoPrivacy
);

// Увеличивает счетчик просмотров.
videoRoutes.patch(
  '/:videoId/views',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.incrementViewsCount
);

// Удаляет видео владельца.
videoRoutes.delete(
  '/:videoId/delete',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.deleteVideo
);

// Удаляет загруженные медиафайлы.
videoRoutes.delete(
  '/delete-uploaded-video',
  authMiddleware,
  videoController.deleteUploadedMedia
);

// Удаляет загруженное превью.
videoRoutes.delete(
  '/delete-uploaded-preview',
  authMiddleware,
  videoController.deleteUploadedPreview
);

// Удаляет загруженную обложку.
videoRoutes.delete(
  '/delete-uploaded-thumb',
  authMiddleware,
  videoController.deleteUploadedThumbnail
);

module.exports = videoRoutes;
