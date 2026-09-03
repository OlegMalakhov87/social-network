const videoService = require('../services/videoService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const toPublicUrl = require('../utils/toPublicUrl');

const videoController = {
  /**
   * Получение публичной ленты видео и поиск
   */
  getVideos: async (req, res, next) => {
    try {
      const { page, limit, category, q, sortKey } = req.query;
      const currentUserId = req.user?.id;
      const result = await videoService.getVideos({
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        q,
        currentUserId: parseInt(currentUserId),
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание видео
   */
  createVideo: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await videoService.createVideo(
        parseInt(currentUserId),
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление приватности видео
   */
  updateVideoPrivacy: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await videoService.updateVideoPrivacy(
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление видео
   */
  updateVideo: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const currentUserId = req.user?.id;
      const result = await videoService.updateVideo(
        parseInt(videoId),
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Инкремент счетчика просмотров видео
   */
  incrementViewCount: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await videoService.incrementViewCount(parseInt(videoId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление видео (владелец)
   */
  deleteVideo: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const currentUserId = req.user?.id;
      const result = await videoService.deleteVideo(
        parseInt(videoId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление (очистка мусора)загруженных медиа файлов в случае если пользователь отказался добавлять видео
   */
  deleteUploadedMedia: async (req, res, next) => {
    try {
      await videoService.deleteUploadedMedia(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление загруженных медиа превью
   */
  deleteUploadedPreview: async (req, res, next) => {
    try {
      await videoService.deleteUploadedPreview(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление загруженных медиа thumbnail
   */
  deleteUploadedThumbnail: async (req, res, next) => {
    try {
      await videoService.deleteUploadedThumbnail(req.body);
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка видео файла
   */
  uploadVideo: async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: 'Видеофайл не предоставлен', code: 'NO_FILE' });

      const videoPath = req.file.path;

      const videoMetadata = await mediaService.getMetadata(videoPath);

      const previewPath = await videoPreviewService.generatePreview(
        videoPath,
        videoMetadata.duration
      );

      const thumbnailPath = await videoPreviewService.generateThumbnail(
        videoPath,
        videoMetadata.duration
      );

      res.status(200).json({
        videoUrl: toPublicUrl(videoPath),
        previewUrl: toPublicUrl(previewPath),
        thumbnailUrl: toPublicUrl(thumbnailPath),
        duration: videoMetadata.duration,
        size: videoMetadata.size,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка обложки видео
   */
  uploadThumbnail: async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: 'Файл превью не предоставлен', code: 'NO_FILE' });
      res.status(200).json({ thumbnailUrl: toPublicUrl(req.file.path) });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка превью видео
   */
  uploadPreview: async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: 'Файл превью не предоставлен', code: 'NO_FILE' });
      res.status(200).json({ previewUrl: toPublicUrl(req.file.path) });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = videoController;
