const newsService = require('../services/newsService');
const temporaryMediaService = require('../services/temporaryMediaService');
const { runUploadPipeline } = require('../services/uploadPipeline');
const { createError } = require('../utils/createError');
const { pickMediaFields } = require('../utils/pickMediaFields');

const newsController = {
  /**
   * Возвращает список новостей.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Возвращает новость по идентификатору для кнопки «Поделиться».
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Создает новость.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Загружает изображение или видео для новости.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  uploadMedia: async (req, res, next) => {
    try {
      const result = await runUploadPipeline(req.file, Number(req.user?.id), {
        fieldName: 'newsUrl',
        allowedTypes: ['image', 'video'],
        maxDuration: 60,
        durationError: 'Длительность видео не должна превышать 1 минуты',
        durationErrorCode: 'NEWS_VIDEO_DURATION_EXCEEDED',
        generateDerived: true,
        entity: 'news',
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновляет новость.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Увеличивает счетчик просмотров новости.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Удаляет новость.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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

      const media = pickMediaFields(req.body, [
        'newsUrl',
        'previewUrl',
        'thumbnailUrl',
      ]);

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

module.exports = newsController;
