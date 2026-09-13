const { param } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для лайков
 */
const validateLike = [
  param('targetType')
    .notEmpty()
    .trim()
    .isIn(['posts', 'tracks', 'videos', 'news', 'comments', 'messages'])
    .withMessage('Некорректный тип сущности'),

  param('targetId')
    .notEmpty()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Некорректный ID сущности'),

  validateErrors('Ошибка лайка'),
];

module.exports = { validateLike };
