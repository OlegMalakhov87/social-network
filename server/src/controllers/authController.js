const { authService } = require('../services/authService');

const authController = {
  /**
   * Получение информации о текущем пользователе
   */
  getMe: async (req, res, next) => {
    try {
      const result = await authService.getMe(parseInt(req.user?.id));
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Регистрация пользователя
   */
  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Вход в систему
   */
  login: async (req, res, next) => {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
