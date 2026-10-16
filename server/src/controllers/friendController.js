const friendService = require('../services/friendService');

const friendController = {
  /**
   * Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя
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
   * Отправить заявку в друзья
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
   * Принять заявку в друзья
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
   * Удалить из друзей, разблокировать, отменить заявку на дружбу
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
   * Заблокировать пользователя
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
