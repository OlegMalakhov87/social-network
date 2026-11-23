const videoService = require('../services/videoService');
const temporaryMediaService = require('../services/temporaryMediaService');
const { runUploadPipeline } = require('../services/uploadPipeline');
const { createError } = require('../utils/createError');
const { pickMediaFields } = require('../utils/pickMediaFields');

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
      const result = await videoService.createVideo(currentUserId, req.body);
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
    try {
      const result = await runUploadPipeline(req.file, Number(req.user?.id), {
        fieldName: 'videoUrl',
        allowedTypes: ['video'],
        maxDuration: 1800,
        durationError: 'Длительность видео не должна превышать 30 минут',
        durationErrorCode: 'VIDEO_DURATION_EXCEEDED',
        generateDerived: true,
        withMetadata: true,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
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
    try {
      const result = await runUploadPipeline(req.file, Number(req.user?.id), {
        fieldName: 'thumbnailUrl',
        allowedTypes: ['image'],
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
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
    try {
      const result = await runUploadPipeline(req.file, Number(req.user?.id), {
        fieldName: 'previewUrl',
        allowedTypes: ['video'],
        maxDuration: 6,
        durationError: 'Длительность превью не должна превышать 6 секунд',
        durationErrorCode: 'PREVIEW_DURATION_EXCEEDED',
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
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

      const media = pickMediaFields(req.body, [
        'videoUrl',
        'previewUrl',
        'thumbnailUrl',
      ]);

      if (media.length === 0) {
        return res.status(400).json({
          error: 'Не переданы медиафайлы для удаления',
          code: 'NO_MEDIA_TO_DELETE',
        });
      }

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

      const media = pickMediaFields(req.body, ['previewUrl']);

      if (media.length === 0) {
        return res.status(400).json({
          error: 'Не переданы медиафайлы для удаления',
          code: 'NO_MEDIA_TO_DELETE',
        });
      }

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

      const media = pickMediaFields(req.body, ['thumbnailUrl']);

      if (media.length === 0) {
        return res.status(400).json({
          error: 'Не переданы медиафайлы для удаления',
          code: 'NO_MEDIA_TO_DELETE',
        });
      }

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

module.exports = videoController;
