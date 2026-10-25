const { body } = require('express-validator');

const { validateErrors } = require('../../utils/validateErrors');

/**
 * Проверяет поля комментария.
 */
const validateComment = [
  body('targetId')
    .notEmpty()
    .withMessage('ID сущности обязателен')
    .isInt({ min: 1 })
    .withMessage('ID сущности должен быть числом больше 0')
    .toInt(),

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

  validateErrors('Ошибка добавления комментария'),
];

module.exports = {
  validateComment,
};
