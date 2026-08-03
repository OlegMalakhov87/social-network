const likeService = require('../services/likeService');

const likeController = {
  /**
   * Поставить лайк сущности
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  addLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.addLike(
        req.user.id,
        targetType,
        targetId
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Убрать лайк с сущности
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  removeLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.removeLike(
        req.user.id,
        targetType,
        targetId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Проверить, поставлен ли лайк сущности
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  checkLike: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.checkLike(
        req.user.id,
        targetType,
        targetId
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить все лайки сущности
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getLikesByTarget: async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params;
      const result = await likeService.getLikesByTarget(targetType, targetId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить все лайки пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getUserLikes: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;
      const result = await likeService.getUserLikes(userId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = likeController;
