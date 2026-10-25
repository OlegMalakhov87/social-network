const commentService = require('../services/commentService');

const commentController = {
  /**
   * Возвращает комментарии сущности.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getAllCommentsTarget: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const { page, limit, sortKey } = req.query;
      const currentUserId = Number(req.user?.id);

      const result = await commentService.getCommentsByTarget({
        targetType,
        targetId: Number(targetId),
        page: Number(page),
        limit: Number(limit),
        currentUserId,
        sortKey,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Возвращает комментарий по идентификатору.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getCommentById: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const result = await commentService.getCommentById(Number(commentId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создает комментарий.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  createComment: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await commentService.createComment(
        currentUserId,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновляет комментарий.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  updateComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await commentService.updateComment(
        Number(commentId),
        currentUserId,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет комментарий.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  deleteComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await commentService.deleteComment(
        Number(commentId),
        currentUserId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = commentController;
