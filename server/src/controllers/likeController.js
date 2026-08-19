const likeService = require('../services/likeService');

const likeController = {
  /**
   * Получить все лайки сущности
   */
  getLikesByTarget: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.getLikesByTarget(
        targetType,
        parseInt(targetId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить все лайки пользователя
   */
  getUserLikes: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
      const result = await likeService.getUserLikes(
        parseInt(userId),
        parseInt(page),
        parseInt(limit)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Проверить, поставлен ли лайк сущности
   */
  checkLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.checkLike(
        parseInt(req.user.id),
        targetType,
        parseInt(targetId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Поставить лайк сущности
   */
  addLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.addLike(
        parseInt(req.user.id),
        targetType,
        parseInt(targetId)
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить лайк у сущности
   */
  deleteLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.deleteLike(
        parseInt(req.user.id),
        targetType,
        parseInt(targetId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = likeController;
