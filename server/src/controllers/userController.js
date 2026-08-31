const userService = require('../services/userService');

const userController = {
  /**
   * Получить данные о пользователе и статусе дружбы
   */
  getUserProfileWithFriendshipStatus: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await userService.getUserProfileWithFriendshipStatus({
        currentUserId: parseInt(req.user?.id),
        targetUserId: parseInt(userId),
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Проверка онлайн статуса пользователей
   */
  checkOnlineBulk: async (req, res, next) => {
    try {
      const { userIds } = req.body;
      const result = await userService.checkOnlineBulk(userIds);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление пользователя
   */
  updateUser: async (req, res, next) => {
    try {
      const userId = parseInt(req.user?.id);
      const result = await userService.updateUser(userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление приватности пользователя
   */
  updatePrivacy: async (req, res, next) => {
    try {
      const userId = parseInt(req.user?.id);
      const result = await userService.updatePrivacy(userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  /**
   * Загрузка аватара пользователя
   */
  uploadAvatar: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }

      const result = await userService.uploadAvatar(
        parseInt(req.user?.id),
        req.file
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Изменение пароля пользователя
   */
  changePassword: async (req, res, next) => {
    try {
      const userId = parseInt(req.user?.id);
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Удаление пользователя
   */
  deleteUser: async (req, res, next) => {
    try {
      const userId = parseInt(req.user?.id);
      const result = await userService.deleteUser(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
