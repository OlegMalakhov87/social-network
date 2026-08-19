const jwt = require('jsonwebtoken');
const { createError } = require('../services/authService');

/**
 * Middleware для проверки авторизации пользователя
 */
const authMiddleware = (req, res, next) => {
  try {
    // Получаем токен из заголовка authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError(
        'Токен не предоставлен или имеет неверный формат',
        401,
        'INVALID_TOKEN'
      );
    }

    // Получаем токен из заголовка authorization
    const token = authHeader.split(' ')[1];

    // Декодируем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Кладем в req только ID. Если сервису нужен весь юзер, он его запросит.
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError('Недействительный токен', 401, 'INVALID_TOKEN'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(
        createError('Срок действия токена истек', 401, 'TOKEN_EXPIRED')
      );
    }
    next(error);
  }
};

module.exports = authMiddleware;
