const fs = require('node:fs/promises');

const videoService = require('../services/videoService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const mediaStorageService = require('../services/mediaStorageService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

const videoController = {
  /**
   * Возвращает публичную ленту видео и результат поиска.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getVideos: async (req, res, next) => {
    try {
      const { page, limit, category, q, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await videoService.getVideos({
        page: Number(page),
        limit: Number(limit),
        category,
        q,
        currentUserId,
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создает видео.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  createVideo: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await videoService.createVideo(
        currentUserId,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загружает видеофайл.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadVideo: async (req, res, next) => {
    const createdFiles = [];
    let registered = false;

    /**
     * Сохраняет путь временного файла до любых операций.
     */
    const stagingPath = req.file?.path;

    try {
      if (!req.file)
        return res
          .status(400)
          .json({ error: 'Видеофайл не предоставлен', code: 'NO_FILE' });

      const mediaType = req.file.mediaType;
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

      if (!['video'].includes(mediaType)) {
        throw createError(
          'Разрешены только видео',
          400,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }

      /**
       * Проверяет видео, пока файл находится в закрытом каталоге.
       */
      const videoMetadata = await mediaService.getMetadata(
        stagingPath,
        'video'
      );

      if (
        !Number.isFinite(videoMetadata.duration) ||
        videoMetadata.duration <= 0 ||
        videoMetadata.duration > 1800
      ) {
        throw createError(
          'Длительность видео не должна превышать 30 минут',
          400,
          'VIDEO_DURATION_EXCEEDED'
        );
      }

      /**
       * Переносит файл в MEDIA_ROOT только после успешной проверки.
       */
      const videoPath = await mediaStorageService.publish(req.file);

      createdFiles.push(videoPath);

      const previewPath = await videoPreviewService.generatePreview(
        videoPath,
        videoMetadata.duration
      );

      createdFiles.push(previewPath);

      const thumbnailPath = await videoPreviewService.generateThumbnail(
        videoPath,
        videoMetadata.duration
      );

      createdFiles.push(thumbnailPath);

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
      registered = true;

      return res.status(200).json({
        videoUrl,
        previewUrl,
        thumbnailUrl,
        duration: Math.max(1, Math.round(videoMetadata.duration)),
        size: Math.max(1024, Math.round(videoMetadata.size)),
      });
    } catch (error) {
      if (!registered && createdFiles.length > 0) {
        await Promise.allSettled(
          createdFiles.map(async (filePath) => {
            try {
              await fs.unlink(filePath);

              console.log(
                '[VideoController] Удалён файл после ошибки:',
                filePath
              );
            } catch (cleanupError) {
              if (cleanupError.code !== 'ENOENT') {
                console.error(
                  '[VideoController] Ошибка удаления файла после ошибки:',
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
              '[VideoController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }
      return next(error);
    }
  },

  /**
   * Загружает обложку видео.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadThumbnail: async (req, res, next) => {
    let registered = false;

    /**
     * Сохраняет путь временного файла до любых операций.
     */
    const stagingPath = req.file?.path;

    let thumbnailPath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Файл обложки не предоставлен',
          code: 'NO_FILE',
        });
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

      if (!['image'].includes(mediaType)) {
        throw createError(
          'Разрешены только изображения',
          400,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }
      /**
       * Переносит файл в MEDIA_ROOT только после успешной проверки.
       */
      thumbnailPath = await mediaStorageService.publish(req.file);

      const thumbnailUrl = toPublicUrl(thumbnailPath);

      const media = [
        {
          userId: currentUserId,
          url: thumbnailUrl,
          mediaType: 'image',
          fieldName: 'thumbnailUrl',
        },
      ];

      await temporaryMediaService.registerMany(media);

      registered = true;

      return res.status(200).json({ thumbnailUrl });
    } catch (error) {
      if (!registered && thumbnailPath) {
        try {
          await fs.unlink(thumbnailPath);

          console.log(
            '[VideoController] Удалён файл обложки после ошибки:',
            thumbnailPath
          );
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[VideoController] Ошибка удаления обложки:',
              cleanupError
            );
          }
        }
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
              '[VideoController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }
      return next(error);
    }
  },

  /**
   * Загружает превью видео.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadPreview: async (req, res, next) => {
    let registered = false;

    /**
     * Сохраняет путь временного файла до любых операций.
     */
    const stagingPath = req.file?.path;

    let previewPath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Файл превью не предоставлен',
          code: 'NO_FILE',
        });
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

      if (!['video'].includes(mediaType)) {
        throw createError(
          'Разрешены только видео',
          400,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }

      /**
       * Проверяет превью, пока файл находится в закрытом каталоге.
       */
      const previewMetadata = await mediaService.getMetadata(
        stagingPath,
        'video'
      );

      if (previewMetadata.duration > 6) {
        throw createError(
          'Длительность превью не должна превышать 6 секунд',
          400,
          'PREVIEW_DURATION_EXCEEDED'
        );
      }

      /**
       * Переносит файл в MEDIA_ROOT только после успешной проверки.
       */
      previewPath = await mediaStorageService.publish(req.file);

      const previewUrl = toPublicUrl(previewPath);

      const media = [
        {
          userId: currentUserId,
          url: previewUrl,
          mediaType: 'video',
          fieldName: 'previewUrl',
        },
      ];

      await temporaryMediaService.registerMany(media);
      registered = true;

      return res.status(200).json({ previewUrl });
    } catch (error) {
      if (!registered && previewPath) {
        try {
          await fs.unlink(previewPath);

          console.log(
            '[VideoController] Удалён файл превью после ошибки:',
            previewPath
          );
        } catch (cleanupError) {
          if (cleanupError.code !== 'ENOENT') {
            console.error(
              '[VideoController] Ошибка удаления превью:',
              cleanupError
            );
          }
        }
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
              '[VideoController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }
      return next(error);
    }
  },

  /**
   * Обновляет приватность видео.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updateVideoPrivacy: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await videoService.updateVideoPrivacy(
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновляет видео.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updateVideo: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await videoService.updateVideo(
        Number(videoId),
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Увеличивает счетчик просмотров видео.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  incrementViewsCount: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const result = await videoService.incrementViewsCount(Number(videoId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет видео владельца.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteVideo: async (req, res, next) => {
    try {
      const { videoId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await videoService.deleteVideo(
        Number(videoId),
        currentUserId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет загруженные медиафайлы, если пользователь отменил добавление видео.
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
      // Удаляет временные медиафайлы, которые пользователь не сохранил.
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
   * Удаляет загруженное превью.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteUploadedPreview: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

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
   * Удаляет загруженную обложку.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteUploadedThumbnail: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

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
