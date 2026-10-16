const fs = require('node:fs/promises');
const videoService = require('../services/videoService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const mediaStorageService = require('../services/mediaStorageService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

/**
 * Контроллер для работы с видео
 */
const videoController = {
  /**
   * Получение публичной ленты видео и поиск
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
   * Создание видео
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
   * Загрузка видео файла
   */
  uploadVideo: async (req, res, next) => {
    const createdFiles = [];
    let registered = false;

    /** Сохраняем путь временного файла до любых операций */
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

      /** Проверяем видео, пока оно ещё в закрытой директории */
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

      /** Только после успешной проверки переносим файл в MEDIA_ROOT */
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

      /** Если ошибка произошла до публикации, исходный файл всё ещё находится в staging */
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
   * Загрузка обложки видео
   */
  uploadThumbnail: async (req, res, next) => {
    let registered = false;

    /** Сохраняем путь временного файла до любых операций */
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
      /** Только после успешной проверки переносим файл в MEDIA_ROOT */
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
      /** Если ошибка произошла до публикации, исходный файл всё ещё находится в staging */
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
   * Загрузка превью видео
   */
  uploadPreview: async (req, res, next) => {
    let registered = false;

    /** Сохраняем путь временного файла до любых операций */
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

      /** Проверяем превью, пока оно ещё в закрытой директории */
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

      /** Только после успешной проверки переносим файл в MEDIA_ROOT */
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

      /** Если ошибка произошла до публикации, исходный файл всё ещё находится в staging */
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
   * Обновление приватности видео
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
   * Обновление видео
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
   * Инкремент счетчика просмотров видео
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
   * Удаление видео (владелец)
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
   * Удаление (очистка мусора)загруженных медиа файлов в случае если пользователь отказался добавлять видео
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
   * Удаление загруженных медиа thumbnail
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
