const { validationResult } = require('express-validator');

/**
 * Возвращает промежуточный обработчик проверки ошибок валидации.
 *
 * @param {string} [message='Ошибка валидации'] - Текст ошибки для пользователя
 * @returns {Function} Промежуточный обработчик, который отвечает кодом 400 или передает управление дальше.
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
