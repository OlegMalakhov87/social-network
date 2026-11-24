const postService = require('../services/postService');
const temporaryMediaService = require('../services/temporaryMediaService');
const { runUploadPipeline } = require('../services/uploadPipeline');
const { createError } = require('../utils/createError');
const { pickMediaFields } = require('../utils/pickMediaFields');

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
    try {
      const result = await runUploadPipeline(req.file, Number(req.user?.id), {
        fieldName: 'postUrl',
        allowedTypes: ['image', 'video'],
        maxDuration: 60,
        durationError: 'Длительность видео не должна превышать 1 минуты',
        durationErrorCode: 'POST_VIDEO_DURATION_EXCEEDED',
        generateDerived: true,
        entity: 'posts'
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
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

      const media = pickMediaFields(req.body, [
        'postUrl',
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

module.exports = postController;
