const { createError } = require('../../utils/createError');

/**
 * Проверяет источник запроса.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
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
