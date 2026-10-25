const fs = require('node:fs/promises');

const postService = require('../services/postService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const mediaStorageService = require('../services/mediaStorageService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

const postController = {
  /**
   * Возвращает посты пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getUserPosts: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);

      const result = await postService.getUserPosts({
        targetUserId: Number(userId),
        currentUserId,
        page: Number(page),
        limit: Number(limit),
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Возвращает пост по идентификатору для кнопки «Поделиться».
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getPostById: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await postService.getPostById(
        Number(postId),
        currentUserId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создает пост.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  createPost: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await postService.createPost(currentUserId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загружает изображение или видео для поста.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadMedia: async (req, res, next) => {
    const createdFiles = [];
    let registered = false;

    /**
     * Сохраняет путь временного файла до любых операций.
     */
    const stagingPath = req.file?.path;

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }

      const mediaType = req.file.mediaType;
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

      if (!['image', 'video'].includes(mediaType)) {
        throw createError(
          'Разрешены только изображения и видео',
          400,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }

      let metadata = null;

      /**
       * Проверяет видео, пока файл находится в закрытом каталоге.
       */
      if (mediaType === 'video') {
        metadata = await mediaService.getMetadata(stagingPath, 'video');

        if (
          !Number.isFinite(metadata.duration) ||
          metadata.duration <= 0 ||
          metadata.duration > 60
        ) {
          throw createError(
            'Длительность видео не должна превышать 1 минуты',
            400,
            'POST_VIDEO_DURATION_EXCEEDED'
          );
        }
      }

      /**
       * Переносит файл в MEDIA_ROOT только после успешной проверки.
       */
      const mediaPath = await mediaStorageService.publish(req.file);

      createdFiles.push(mediaPath);

      const postUrl = toPublicUrl(mediaPath);
      let previewUrl = null;
      let thumbnailUrl = null;

      const media = [
        {
          userId: currentUserId,
          url: postUrl,
          mediaType,
          fieldName: 'postUrl',
        },
      ];

      if (mediaType === 'video') {
        const previewPath = await videoPreviewService.generatePreview(
          mediaPath,
          metadata.duration
        );

        createdFiles.push(previewPath);

        const thumbnailPath = await videoPreviewService.generateThumbnail(
          mediaPath,
          metadata.duration
        );
        createdFiles.push(thumbnailPath);

        previewUrl = toPublicUrl(previewPath);
        thumbnailUrl = toPublicUrl(thumbnailPath);

        media.push(
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
          }
        );
      }

      await temporaryMediaService.registerMany(media);
      registered = true;

      return res.status(200).json({
        postUrl,
        previewUrl,
        thumbnailUrl,
      });
    } catch (error) {
      if (!registered && createdFiles.length > 0) {
        await Promise.allSettled(
          createdFiles.map(async (filePath) => {
            try {
              await fs.unlink(filePath);

              console.log(
                '[PostController] Удалён файл после ошибки:',
                filePath
              );
            } catch (cleanupError) {
              if (cleanupError.code !== 'ENOENT') {
                console.error(
                  '[PostController] Ошибка удаления файла после ошибки:',
                  cleanupError
                );
              }
            }
          })
        );
      }
      /**
       * Удаляет исходный файл из временного каталога, если публикация не началась.
       */
      if (stagingPath) {
        try {
          await fs.unlink(stagingPath);
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[PostController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }

      return next(error);
    }
  },

  /**
   * Обновляет пост.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updatePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await postService.updatePost(
        Number(postId),
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновляет приватность постов.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updatePostPrivacy: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await postService.updatePostPrivacy(
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет пост.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deletePost: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await postService.deletePost(
        Number(postId),
        currentUserId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет загруженные медиафайлы, если пользователь отменил создание.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteUploadedMedia: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

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
