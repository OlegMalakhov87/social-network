const commentService = require('../services/commentService');

const commentController = {
  /**
   * Получение комментариев для конкретной сущности
   */
  getAllCommentsTarget: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const { page, limit, sortKey } = req.query;
      const currentUserId = req.user?.id;

      const result = await commentService.getCommentsByTarget(
        targetType,
        parseInt(targetId),
        parseInt(page),
        parseInt(limit),
        parseInt(currentUserId),
        sortKey
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение комментариев пользователя (для админки)
   */
  getAllCommentsUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit, sortKey } = req.query;

      const result = await commentService.getUserComments(
        userId,
        parseInt(page),
        parseInt(limit),
        sortKey
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение комментария по ID
   */
  getCommentById: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const result = await commentService.getCommentById(parseInt(commentId));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Создание комментария
   */
  createComment: async (req, res, next) => {
    try {
      const currentUserId = req.user?.id;
      const result = await commentService.createComment(
        parseInt(currentUserId),
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление комментария
   */
  updateComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const currentUserId = req.user?.id;
      const result = await commentService.updateComment(
        parseInt(commentId),
        parseInt(currentUserId),
        req.body
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление комментария
   */
  deleteComment: async (req, res, next) => {
    try {
      const { commentId } = req.params;
      const currentUserId = req.user?.id;
      const result = await commentService.deleteComment(
        parseInt(commentId),
        parseInt(currentUserId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = commentController;
