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

      const { sessionId } = req.body ?? {};

      const uuidPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

      if (typeof sessionId !== 'string' || !uuidPattern.test(sessionId)) {
        return res.status(400).json({
          code: 'INVALID_SESSION_ID',
          message: 'Некорректный идентификатор сессии',
        });
      }

      const result = await authService.logout(currentRefreshToken, {
        expectedSessionId: sessionId,
      });

      if (result.reason === 'SESSION_CHANGED') {
        return res.status(409).json({
          code: 'SESSION_CHANGED',
          message: 'Текущая сессия изменилась',
        });
      }

      clearRefreshCookie(res);

      return res.json({
        message: 'Выход выполнен успешно',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
