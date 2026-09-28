const postService = require('../services/postService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const { toPublicUrl } = require('../utils/toPublicUrl');

const postController = {
  /**
   * Получение постов пользователя
   */
  getUserPosts: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit, sortKey } = req.query;
      const currentUserId = req.user?.id;

      const result = await postService.getUserPosts({
        targetUserId: parseInt(userId),
        currentUserId: parseInt(currentUserId),
        page: parseInt(page),
        limit: parseInt(limit),
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение поста по ID
   */
  getPostById: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;
      const result = await postService.getPostById(
        parseInt(postId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание поста
   */
  createPost: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await postService.createPost(
        parseInt(currentUserId),
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка медиа файла
   */
  uploadMedia: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }

      const currentUserId = parseInt(req.user?.id);
      const mediaPath = req.file.path;

      let postUrl = null;
      let previewUrl = null;
      let thumbnailUrl = null;

      // Генерируем медиа файлы для видео и сохраняем в temporaryMediaService
      if (req.file.mimetype.startsWith('video/')) {
        // Получаем метаданные видео
        const postMetadata = await mediaService.getMetadata(mediaPath);

        // Генерируем превью видео
        const previewPath = await videoPreviewService.generatePreview(
          mediaPath,
          postMetadata.duration
        );

        // Генерируем обложку видео
        const thumbnailPath = await videoPreviewService.generateThumbnail(
          mediaPath,
          postMetadata.duration
        );

        postUrl = toPublicUrl(mediaPath);
        previewUrl = toPublicUrl(previewPath);
        thumbnailUrl = toPublicUrl(thumbnailPath);

        // Сохраняем медиа файлы в temporaryMediaService
        await temporaryMediaService.registerMany([
          {
            userId: currentUserId,
            url: postUrl,
            mediaType: 'video',
            fieldName: 'postUrl',
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
        ]);
      }

      // Сохраняем медиа файлы в temporaryMediaService
      if (req.file.mimetype.startsWith('image/')) {
        postUrl = toPublicUrl(mediaPath);

        await temporaryMediaService.registerMany([
          {
            userId: currentUserId,
            url: postUrl,
            mediaType: 'image',
            fieldName: 'postUrl',
          },
        ]);
      }

      return res.status(200).json({
        postUrl,
        previewUrl,
        thumbnailUrl,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление поста
   */
  updatePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;
      const result = await postService.updatePost(
        parseInt(postId),
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление приватности постов
   */
  updatePostPrivacy: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await postService.updatePostPrivacy(
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление поста
   */
  deletePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;
      const result = await postService.deletePost(
        parseInt(postId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление (очистка мусора)загруженных медиа файлов в случае если пользователь отказался добавлять новость
   */
  deleteUploadedMedia: async (req, res, next) => {
    try {
      const currentUserId = parseInt(req.user?.id);
      const media = [
        {
          url: req.body?.postUrl,
          fieldName: 'postUrl',
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
      const result = await temporaryMediaService.removeMany(
        currentUserId,
        media
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = postController;
