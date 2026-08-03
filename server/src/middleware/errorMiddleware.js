const multer = require('multer');

/**
 * Middleware для обработки ошибок
 * @param {Error} err - Ошибка
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const errorMiddleware = (err, req, res, next) => {
  // Логируем ошибку в development окружении
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Кастомные ошибки из сервисов (createError)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code || null, // Машинный код для фронтенда
    });
  }

  // Sequelize ошибки валидации
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: 'Ошибка валидации',
      details: errors,
    });
  }

  // Sequelize ошибки уникальности
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'поле';
    return res.status(400).json({
      error: `Запись с таким ${field} уже существует`,
      code: 'UNIQUE_CONSTRAINT',
    });
  }

  // Sequelize ошибки внешнего ключа
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Связанная запись не найдена',
    });
  }

  // Ошибки JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Недействительный токен', code: 'INVALID_TOKEN' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Токен истек', code: 'TOKEN_EXPIRED' });
  }

  // Ошибки multer
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message, code: 'UPLOAD_ERROR' });
  }

  // По умолчанию
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

module.exports = errorMiddleware;
