const { param } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для лайков
 */
const validateLike = [
  param('targetType')
    .notEmpty()
    .isString()
    .trim()
    .isIn(['posts', 'tracks', 'videos', 'news', 'comments', 'messages'])
    .withMessage('Некорректный тип сущности'),

  param('targetId')
    .notEmpty()
    .withMessage('ID сущности обязателен')
    .isInt({ min: 1 })
    .withMessage('ID сущности должен быть числом больше 0')
    .toInt(),

  validateErrors('Ошибка лайка'),
];

module.exports = { validateLike };
