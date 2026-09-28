const likeService = require('../services/likeService');

const likeController = {
  /**
   * Поставить лайк сущности
   */
  addLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const currentUserId = req.user?.id;
      const result = await likeService.addLike({
        currentUserId: parseInt(currentUserId),
        targetType,
        targetId: parseInt(targetId),
      });
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
      const currentUserId = req.user?.id;
      const result = await likeService.deleteLike({
        currentUserId: parseInt(currentUserId),
        targetType,
        targetId: parseInt(targetId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = likeController;
