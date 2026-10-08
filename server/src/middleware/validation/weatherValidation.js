const { query } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для погоды
 */
const validateWeather = [
  query('lat')
    .notEmpty()
    .isFloat({ min: -90, max: 90 })
    .toFloat()
    .withMessage('Некорректная широта'),

  query('lon')
    .notEmpty()
    .isFloat({ min: -180, max: 180 })
    .toFloat()
    .withMessage('Некорректная долгота'),

  validateErrors('Ошибка погоды'),
];

module.exports = { validateWeather };
