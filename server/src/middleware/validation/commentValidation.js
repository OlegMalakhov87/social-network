const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для комментариев
 */
const validateComment = [
  body('text')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Некорректный текст комментария'),

  body('targetType')
    .notEmpty()
    .isString()
    .trim()
    .isIn(['posts', 'tracks', 'videos', 'news'])
    .withMessage('Некорректный тип комментария'),

  body('targetId')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Некорректный ID сущности'),

  validateErrors('Ошибка добавления комментария'),
];

module.exports = {
  validateComment,
};