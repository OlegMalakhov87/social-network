const videoService = require('../services/videoService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');

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

      // Проверяем, загружены ли пользовательские превью и обложка
      const hasCustomPreview = req.body.previewUrl;
      const hasCustomThumbnail = req.body.thumbnailUrl;

      let previewPath = null;
      let thumbnailPath = null;

      if (!hasCustomPreview) {
        previewPath = await videoPreviewService.generatePreview(videoPath, videoMetadata.duration);
      }

      if (!hasCustomThumbnail) {
        thumbnailPath = await videoPreviewService.generateThumbnail(videoPath, videoMetadata.duration);
      }

      // Генерируем превью и обложку видео.
      res.status(200).json({
        videoUrl: `/${videoPath}`,
        previewUrl: `/${previewPath}`,
        thumbnailUrl: `/${thumbnailPath}`,
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
      res.status(200).json({ thumbnailUrl: `/${req.file.path}` });
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
      res.status(200).json({ previewUrl: `/${req.file.path}` });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = videoController;
