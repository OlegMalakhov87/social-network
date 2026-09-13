const { validationResult } = require('express-validator');

/**
 * Middleware для валидации данных запроса
 * @param {string} [message = 'Ошибка валидации'] - Сообщение об ошибке
 * @returns {Function} Middleware функция, которая проверяет наличие ошибок валидации и возвращает ошибку 400 с сообщением и деталями ошибок
 */
const validateErrors =
  (message = 'Ошибка валидации') =>
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: message,
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      });
    }

    next();
  };

module.exports = { validateErrors };
