const { authService } = require('../services/authService');

const { REFRESH_COOKIE_NAME } = require('../../config/authConfig');

const { setRefreshCookie, clearRefreshCookie } = require('../utils/authCookie');

const authController = {
  /**
   * Получение информации о текущем пользователе
   */
  getMe: async (req, res, next) => {
    try {
      const currentUserId = Number(req.user?.id);
      const result = await authService.getMe(currentUserId);
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
      const { user, token, refreshToken, expiresAt } =
        await authService.register(req.body);

      const remainingMs = Math.max(
        0,
        new Date(expiresAt).getTime() - Date.now()
      );

      setRefreshCookie(res, refreshToken, remainingMs);

      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Вход в систему
   */
  login: async (req, res, next) => {
    try {
      const { user, token, refreshToken, expiresAt } = await authService.login(
        req.body
      );

      const remainingMs = Math.max(
        0,
        new Date(expiresAt).getTime() - Date.now()
      );

      setRefreshCookie(res, refreshToken, remainingMs);

      res.json({ user, token });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Обновление пользовательской авторизации.
   */
  refresh: async (req, res, next) => {
    try {
      const currentRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      const { token, refreshToken, expiresAt } =
        await authService.refresh(currentRefreshToken);

      const remainingMs = Math.max(
        0,
        new Date(expiresAt).getTime() - Date.now()
      );

      setRefreshCookie(res, refreshToken, remainingMs);

      res.json({ token });
    } catch (error) {
      if (error.statusCode === 401) {
        clearRefreshCookie(res);
      }

      next(error);
    }
  },

  /**
   * Завершение пользовательской сессии.
   */
  logout: async (req, res, next) => {
    try {
      const currentRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      await authService.logout(currentRefreshToken);

      clearRefreshCookie(res);

      res.json({ message: 'Выход выполнен успешно' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
