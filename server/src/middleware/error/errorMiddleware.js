const multer = require('multer');

/**
 * Отправляет ответ об ошибке и различает известные типы сбоев.
 *
 * @param {Error} err - Ошибка обработки запроса
 * @param {import('express').Request} req - Запрос Express
 * @param {import('express').Response} res - Ответ Express
 * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
 * @returns {void} Ничего не возвращает.
 */
const errorMiddleware = (err, req, res, next) => {
  // Пишет ошибку в журнал только в среде разработки.
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Отвечает ошибкой службы, если задан код состояния.
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code || null, // Подставляет null, если машинный код отсутствует.
    });
  }

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

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'поле';
    return res.status(409).json({
      error: `Запись с таким ${field} уже существует`,
      code: 'UNIQUE_CONSTRAINT',
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Связанная запись не найдена',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res
      .status(401)
      .json({ error: 'Недействительный токен', code: 'INVALID_TOKEN' });
  }

  if (err.name === 'TokenExpiredError') {
    return res
      .status(401)
      .json({ error: 'Токен истек', code: 'TOKEN_EXPIRED' });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message, code: 'UPLOAD_ERROR' });
  }

  // Отвечает кодом 500, если ошибка не распознана.
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

module.exports = errorMiddleware;
