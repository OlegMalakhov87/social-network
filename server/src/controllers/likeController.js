const likeService = require('../services/likeService');

const likeController = {
  /**
   * Создает лайк сущности.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
   * Удаляет лайк сущности.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
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
