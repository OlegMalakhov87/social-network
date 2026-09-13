const { param } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация ID в параметрах
 */
const validateIdParam = (paramName) => [
  param(paramName)
    .isInt({ min: 1 })
    .toInt()
    .withMessage(`${paramName} должен быть числом`),

  validateErrors(`Неверный формат ${paramName}`),
];

module.exports = {
  validateIdParam,
};
