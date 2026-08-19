const friendService = require('../services/friendService');

const friendController = {
  /**
   * Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя
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
