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

// Библиотека профиля
videoRoutes.get(
  '/profile/:userId',
  validateIdParam('userId'),
  authMiddleware,
  videoController.getUserVideos
);

// Получение видео по ID
videoRoutes.get(
  '/:videoId',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.getVideoById
);

// Загрузка видео файла
videoRoutes.post(
  '/upload-video',
  authMiddleware,
  upload.single('video'),
  handleUploadError,
  videoController.uploadVideo
);

// Загрузка превью видео файла
videoRoutes.post(
  '/upload-thumbnail',
  authMiddleware,
  upload.single('thumbnail'),
  handleUploadError,
  videoController.uploadThumbnail
);

// Создание видео
videoRoutes.post(
  '/',
  authMiddleware,
  validateVideo,
  videoController.createVideo
);

// Обновление видео (владелец)
videoRoutes.put(
  '/:videoId',
  validateIdParam('videoId'),
  authMiddleware,
  validateVideo,
  videoController.updateVideo
);

// Обновление приватности видео
videoRoutes.put(
  '/:videoId/privacy',
  validateIdParam('videoId'),
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
  '/:videoId',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.deleteVideo
);

module.exports = videoRoutes;
