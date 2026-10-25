const { createError } = require('../../utils/createError');

/**
 * Проверяет, что источник запроса совпадает с адресом клиента.
 *
 * @param {import('express').Request} req - Запрос Express
 * @param {import('express').Response} res - Ответ Express
 * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
 * @returns {void} Ничего не возвращает.
 */
const verifyAuthOrigin = (req, res, next) => {
  const allowedOrigin = process.env.CLIENT_URL;

  const origin = req.get('Origin');

  if (!allowedOrigin || origin !== allowedOrigin) {
    return next(
      createError('Недопустимый источник запроса', 403, 'INVALID_ORIGIN')
    );
  }

  next();
};

module.exports = { verifyAuthOrigin };
