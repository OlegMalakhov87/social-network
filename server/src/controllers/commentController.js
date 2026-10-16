const commentService = require('../services/commentService');

const commentController = {
  /**
   * Получение комментариев для конкретной сущности
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
   * Получение комментария по ID
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
   * Создание комментария
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
   * Обновление комментария
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
   * Удаление комментария
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
