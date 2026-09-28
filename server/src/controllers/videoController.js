const videoService = require('../services/videoService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const { toPublicUrl } = require('../utils/toPublicUrl');

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
   * Загрузка видео файла
   */
  uploadVideo: async (req, res, next) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: 'Видеофайл не предоставлен', code: 'NO_FILE' });

      const videoPath = req.file.path;
      const currentUserId = parseInt(req.user?.id);

      const videoMetadata = await mediaService.getMetadata(videoPath);

      const previewPath = await videoPreviewService.generatePreview(
        videoPath,
        videoMetadata.duration
      );

      const thumbnailPath = await videoPreviewService.generateThumbnail(
        videoPath,
        videoMetadata.duration
      );

      const videoUrl = toPublicUrl(videoPath);
      const previewUrl = toPublicUrl(previewPath);
      const thumbnailUrl = toPublicUrl(thumbnailPath);

      const media = [
        {
          userId: currentUserId,
          url: videoUrl,
          mediaType: 'video',
          fieldName: 'videoUrl',
        },
        {
          userId: currentUserId,
          url: previewUrl,
          mediaType: 'video',
          fieldName: 'previewUrl',
        },
        {
          userId: currentUserId,
          url: thumbnailUrl,
          mediaType: 'image',
          fieldName: 'thumbnailUrl',
        },
      ];

      await temporaryMediaService.registerMany(media);

      res.status(200).json({
        videoUrl,
        previewUrl,
        thumbnailUrl,
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
      if (!req.file) {
        return res.status(400).json({
          error: 'Файл превью не предоставлен',
          code: 'NO_FILE',
        });
      }

      const currentUserId = parseInt(req.user?.id);
      const thumbnailUrl = toPublicUrl(req.file.path);

      await temporaryMediaService.registerMany([
        {
          userId: currentUserId,
          url: thumbnailUrl,
          mediaType: 'image',
          fieldName: 'thumbnailUrl',
        },
      ]);

      res.status(200).json({ thumbnailUrl });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка превью видео
   */
  uploadPreview: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Файл превью не предоставлен',
          code: 'NO_FILE',
        });
      }

      const currentUserId = parseInt(req.user?.id);
      const previewUrl = toPublicUrl(req.file.path);

      await temporaryMediaService.registerMany([
        {
          userId: currentUserId,
          url: previewUrl,
          mediaType: 'video',
          fieldName: 'previewUrl',
        },
      ]);

      res.status(200).json({ previewUrl });
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
  incrementViewsCount: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await videoService.incrementViewsCount(parseInt(videoId));
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
      const currentUserId = parseInt(req.user?.id);
      const media = [
        {
          url: req.body?.videoUrl,
          fieldName: 'videoUrl',
        },
        {
          url: req.body?.previewUrl,
          fieldName: 'previewUrl',
        },
        {
          url: req.body?.thumbnailUrl,
          fieldName: 'thumbnailUrl',
        },
      ];
      // Удаляем временные медиа файлы
      const result = await temporaryMediaService.removeMany(
        currentUserId,
        media
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление загруженных медиа превью
   */
  deleteUploadedPreview: async (req, res, next) => {
    try {
      const currentUserId = parseInt(req.user?.id);
      const result = await temporaryMediaService.removeMany(currentUserId, [
        {
          url: req.body?.previewUrl,
          fieldName: 'previewUrl',
        },
      ]);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление загруженных медиа thumbnail
   */
  deleteUploadedThumbnail: async (req, res, next) => {
    try {
      const currentUserId = parseInt(req.user?.id);
      const result = await temporaryMediaService.removeMany(currentUserId, [
        {
          url: req.body?.thumbnailUrl,
          fieldName: 'thumbnailUrl',
        },
      ]);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = videoController;
