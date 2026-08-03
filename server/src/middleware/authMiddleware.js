const jwt = require('jsonwebtoken');
const { AppError } = require('../services/authService');

/**
 * Middleware для проверки авторизации пользователя
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const authMiddleware = (req, res, next) => {
  try {
    // Получаем токен из заголовка authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Токен не предоставлен или имеет неверный формат',
        401
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
      return next(new AppError('Недействительный токен', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Срок действия токена истек', 401));
    }
    next(error);
  }
};

module.exports = authMiddleware;
