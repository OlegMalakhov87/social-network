const { param } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация ID в параметрах
 */
const validateIdParam = (paramName) => [
  param(paramName)
    .notEmpty()
    .withMessage(`${paramName} обязателен`)
    .isInt({ min: 1 })
    .withMessage(`${paramName} должен быть числом больше 0`)
    .toInt(),
  validateErrors(`Ошибка валидации ${paramName}`),
];

module.exports = { validateIdParam };
