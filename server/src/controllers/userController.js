const userService = require('../services/userService');

const userController = {
  /**
   * Поиск пользователей
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  searchUsers: async (req, res, next) => {
    try {
      const { q, page, limit } = req.query;
      const result = await userService.searchUsers(q, page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение всех пользователей
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getAllUsers: async (req, res, next) => {
    try {
      const { page, limit } = req.query;
      const result = await userService.getAllUsers(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Получение пользователя по ID
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  getUserById: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.id;
      const result = await userService.getUserById(userId, currentUserId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Проверка онлайн статуса пользователей
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
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
   * Создание пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  createUser: async (req, res, next) => {
    try {
      const result = await userService.createUser(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  updateUser: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const result = await userService.updateUser(userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Загрузка аватара пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  uploadAvatar: async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: 'Файл не был загружен', code: 'NO_FILE' });
      }

      const result = await userService.uploadAvatar(req.user.id, req.file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Изменение пароля пользователя
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  changePassword: async (req, res, next) => {
    try {
      const userId = req.user.id;
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
   * @param {Object} req - Объект запроса
   * @param {Object} res - Объект ответа
   * @param {Function} next - Функция для перехода к следующему middleware
   * @returns {Promise<void>}
   */
  deleteUser: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const result = await userService.deleteUser(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
