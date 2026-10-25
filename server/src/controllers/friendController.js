const friendService = require('../services/friendService');

const friendController = {
  /**
   * Возвращает пользователей со статусом дружбы.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getUsersWithFriendshipStatus: async (req, res, next) => {
    try {
      const { page, limit, category, q } = req.query;
      const currentUserId = Number(req.user?.id);
      const result = await friendService.getUsersWithFriendshipStatus({
        currentUserId,
        page: Number(page),
        limit: Number(limit),
        category,
        q,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отправляет заявку в друзья.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  sendRequest: async (req, res, next) => {
    try {
      const { friendId } = req.body;
      const currentUserId = Number(req.user?.id);
      const result = await friendService.sendRequest({
        currentUserId,
        friendId: Number(friendId),
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Принимает заявку в друзья.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  acceptRequest: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await friendService.acceptRequest({
        currentUserId,
        friendshipId: Number(friendshipId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаляет дружбу, снимает блокировку или отменяет заявку.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  rejectRequest: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      const currentUserId = Number(req.user?.id);
      const result = await friendService.rejectRequest({
        currentUserId,
        friendshipId: Number(friendshipId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Блокирует пользователя.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  blockUser: async (req, res, next) => {
    try {
      const { friendId } = req.body;
      const currentUserId = Number(req.user?.id);
      const result = await friendService.blockUser({
        currentUserId,
        friendId: Number(friendId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = friendController;
