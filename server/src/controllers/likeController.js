const likeService = require('../services/likeService');

const likeController = {
  /**
   * Поставить лайк сущности
   */
  addLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await likeService.addLike({
        currentUserId,
        targetType,
        targetId: Number(targetId),
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
      const currentUserId = Number(req.user?.id);
      const result = await likeService.deleteLike({
        currentUserId,
        targetType,
        targetId: Number(targetId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = likeController;
