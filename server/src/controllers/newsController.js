const fs = require('node:fs/promises');
const newsService = require('../services/newsService');
const videoPreviewService = require('../services/videoPreviewService');
const mediaService = require('../services/mediaService');
const temporaryMediaService = require('../services/temporaryMediaService');
const mediaStorageService = require('../services/mediaStorageService');
const { toPublicUrl } = require('../utils/toPublicUrl');
const { createError } = require('../utils/createError');

/**
 * Контроллер для работы с новостями
 */
const newsController = {
  /**
   * Получение новостей
   */
  getNews: async (req, res, next) => {
    try {
      const { page, limit, sortKey, category, q } = req.query;
      const currentUserId = Number(req.user?.id);

      const result = await newsService.getNews({
        page: Number(page),
        limit: Number(limit),
        sortKey,
        category,
        q,
        currentUserId,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить новость по ID для кнопки "Поделиться"
   */
  getNewsById: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await newsService.getNewsById(
        Number(newsId),
        currentUserId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание новости
   */
  createNews: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await newsService.createNews(currentUserId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка изображения или видео для новости.
   */
  uploadMedia: async (req, res, next) => {
    const createdFiles = [];
    let registered = false;

    /** Сохраняем путь временного файла до любых операций */
    const stagingPath = req.file?.path;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Файл не был загружен',
          code: 'NO_FILE',
        });
      }

      const currentUserId = Number(req.user?.id);
      const mediaType = req.file.mediaType;

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

      if (!['image', 'video'].includes(mediaType)) {
        throw createError(
          'Допустимы только изображения и видео',
          400,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }

      let metadata = null;

      /** Проверяем видео, пока оно ещё в закрытой директории */
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
            'NEWS_VIDEO_DURATION_EXCEEDED'
          );
        }
      }

      /** Только после успешной проверки переносим файл в MEDIA_ROOT */
      const mediaPath = await mediaStorageService.publish(req.file);

      createdFiles.push(mediaPath);

      const newsUrl = toPublicUrl(mediaPath);
      let previewUrl = null;
      let thumbnailUrl = null;

      const media = [
        {
          userId: currentUserId,
          url: newsUrl,
          mediaType,
          fieldName: 'newsUrl',
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
        newsUrl,
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
                '[NewsController] Удалён файл после ошибки:',
                filePath
              );
            } catch (cleanupError) {
              if (cleanupError.code !== 'ENOENT') {
                console.error(
                  '[NewsController] Ошибка удаления файла после ошибки:',
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
              '[NewsController] Ошибка очистки временного файла:',
              cleanupError
            );
          }
        }
      }

      return next(error);
    }
  },

  /**
   * Обновление новости
   */
  updateNews: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await newsService.updateNews(
        Number(newsId),
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Увеличение счетчика просмотров новости
   */
  incrementViewsCount: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const result = await newsService.incrementViewsCount(Number(newsId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить новость
   */
  deleteNews: async (req, res, next) => {
    try {
      const { newsId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await newsService.deleteNews(
        Number(newsId),
        currentUserId
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
          url: req.body?.newsUrl,
          fieldName: 'newsUrl',
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

module.exports = newsController;
