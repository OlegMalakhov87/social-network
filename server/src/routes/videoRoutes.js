const { Router } = require('express');
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateIdParam,
  validateVideo,
} = require('../middleware/validationMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const videoRoutes = Router();

// Публичная лента и поиск
videoRoutes.get('/', authMiddleware, videoController.getVideos);

// Загрузка видео файла
videoRoutes.post(
  '/upload-video',
  authMiddleware,
  upload.single('videoUrl'),
  handleUploadError,
  videoController.uploadVideo
);

// Загрузка обложки видео файла
videoRoutes.post(
  '/upload-thumbnail',
  authMiddleware,
  upload.single('thumbnailUrl'),
  handleUploadError,
  videoController.uploadThumbnail
);

// Загрузка превью видео файла
videoRoutes.post(
  '/upload-preview',
  authMiddleware,
  upload.single('previewUrl'),
  handleUploadError,
  videoController.uploadPreview
);

// Создание видео
videoRoutes.post(
  '/add',
  authMiddleware,
  validateVideo,
  videoController.createVideo
);

// Обновление видео (владелец)
videoRoutes.put(
  '/:videoId/update',
  validateIdParam('videoId'),
  authMiddleware,
  validateVideo,
  videoController.updateVideo
);

// Обновление приватности видео
videoRoutes.put(
  '/update-privacy',
  authMiddleware,
  videoController.updateVideoPrivacy
);

// Инкремент счетчика просмотров видео
videoRoutes.put(
  '/:videoId/views',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.incrementViewCount
);

// Удаление видео (владелец)
videoRoutes.delete(
  '/:videoId/delete',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.deleteVideo
);

module.exports = videoRoutes;
