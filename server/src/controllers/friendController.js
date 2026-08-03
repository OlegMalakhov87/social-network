const friendService = require('../services/friendService');

const friendController = {
  /**
   * Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  getUsersWithFriendshipStatus: async (req, res, next) => {
    try {
      const { page, limit, q } = req.query;
      const result = await friendService.getUsersWithFriendshipStatus(
        req.user.id,
        page,
        limit,
        q
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получить статус дружбы между двумя пользователями
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  getFriendshipStatus: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await friendService.getFriendshipStatus(
        req.user.id,
        parseInt(userId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отправить заявку в друзья
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  sendRequest: async (req, res, next) => {
    try {
      const { friendId } = req.body;
      const result = await friendService.sendRequest(
        req.user.id,
        parseInt(friendId)
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Принять заявку в друзья
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  acceptRequest: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      const result = await friendService.acceptRequest(
        req.user.id,
        parseInt(friendshipId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отклонить заявку в друзья
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  rejectRequest: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      const result = await friendService.rejectRequest(
        req.user.id,
        parseInt(friendshipId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить дружбу
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  deleteFriendship: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      const result = await friendService.deleteFriendship(
        req.user.id,
        parseInt(friendshipId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Заблокировать пользователя
   * @param {Request} req - Express request объект
   * @param {Response} res - Express response объект
   * @param {Function} next - Express next функция
   * @returns {Promise<void>}
   */
  blockUser: async (req, res, next) => {
    try {
      const { friendId } = req.body;
      const result = await friendService.blockUser(
        req.user.id,
        parseInt(friendId)
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = friendController;
