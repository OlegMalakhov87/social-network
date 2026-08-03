const commentService = require('../services/commentService');

const commentController = {
  /**
   * Получение комментариев для конкретной сущности
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getAllCommentsTarget: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const { page, limit } = req.query;

      const result = await commentService.getCommentsByTarget(
        targetType,
        targetId,
        page,
        limit
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение комментария по ID
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getCommentById: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const result = await commentService.getCommentById(commentId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение комментариев пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getAllCommentsUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const result = await commentService.getUserComments(userId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание комментария
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  createComment: async (req, res, next) => {
    try {
      const result = await commentService.createComment(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление комментария
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updateComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const result = await commentService.updateComment(
        commentId,
        req.user.id,
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление комментария
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  deleteComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const result = await commentService.deleteComment(commentId, req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = commentController;
