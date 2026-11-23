const musicService = require('../services/musicService');
const temporaryMediaService = require('../services/temporaryMediaService');
const { runUploadPipeline } = require('../services/uploadPipeline');
const { createError } = require('../utils/createError');
const { pickMediaFields } = require('../utils/pickMediaFields');

const musicController = {
  /**
   * Возвращает публичную ленту треков и результат поиска.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getMusic: async (req, res, next) => {
    try {
      const { page, limit, category, q, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await musicService.getMusic({
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
   * Создает трек.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  createMusic: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await musicService.createMusic(currentUserId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загружает аудиофайл трека.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadAudio: async (req, res, next) => {
    try {
      const result = await runUploadPipeline(req.file, Number(req.user?.id), {
        fieldName: 'audioUrl',
        allowedTypes: ['audio'],
        maxDuration: 600,
        durationError: 'Длительность трека не должна превышать 10 минут',
        durationErrorCode: 'AUDIO_DURATION_EXCEEDED',
        withMetadata: true,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  /**
   * Загружает обложку трека.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadCover: async (req, res, next) => {
    try {
      const result = await runUploadPipeline(req.file, Number(req.user?.id), {
        fieldName: 'coverUrl',
        allowedTypes: ['image'],
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновляет приватность треков.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updateMusicPrivacy: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await musicService.updateMusicPrivacy(
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновляет трек.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updateMusic: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await musicService.updateMusic(
        Number(trackId),
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Увеличивает счетчик прослушиваний.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  incrementPlaysCount: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const result = await musicService.incrementPlaysCount(Number(trackId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет трек владельца.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteMusic: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await musicService.deleteMusic(
        Number(trackId),
        currentUserId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет загруженный аудиофайл, если пользователь отменил добавление трека.
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

      const media = pickMediaFields(req.body, ['audioUrl', 'coverUrl']);

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
   * Удаляет загруженную обложку.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteUploadedCover: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);

      if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
        throw createError(
          'Некорректный идентификатор пользователя',
          401,
          'INVALID_USER_ID'
        );
      }

      const media = pickMediaFields(req.body, ['coverUrl']);

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

module.exports = musicController;
