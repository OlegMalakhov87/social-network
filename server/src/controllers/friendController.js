const friendService = require('../services/friendService');

const friendController = {
  /**
   * Получить всех пользователей с отметкой о статусе дружбы для текущего пользователя
   */
  getUsersWithFriendshipStatus: async (req, res, next) => {
    try {
      const { page, limit, category, q } = req.query;
      const result = await friendService.getUsersWithFriendshipStatus({
        currentUserId: parseInt(req.user?.id),
        page: parseInt(page),
        limit: parseInt(limit),
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
      const result = await friendService.sendRequest({
        currentUserId: parseInt(req.user?.id),
        friendId: parseInt(friendId),
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
      const result = await friendService.acceptRequest({
        currentUserId: parseInt(req.user?.id),
        friendshipId: parseInt(friendshipId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Отклонить/отменить заявку в друзья
   */
  rejectRequest: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      const result = await friendService.rejectRequest({
        currentUserId: parseInt(req.user?.id),
        friendshipId: parseInt(friendshipId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удалить дружбу (любое направление)
   */
  deleteFriendship: async (req, res, next) => {
    try {
      const { friendshipId } = req.params;
      const result = await friendService.deleteFriendship({
        currentUserId: parseInt(req.user?.id),
        friendshipId: parseInt(friendshipId),
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
      const result = await friendService.blockUser({
        currentUserId: parseInt(req.user?.id),
        friendId: parseInt(friendId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = friendController;
