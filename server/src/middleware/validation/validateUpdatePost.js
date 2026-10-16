const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

const optionalText = (field, min, max, message) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage(message)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(message)
    .bail()
    .isLength({ min, max })
    .withMessage(message);

/**
 * Валидация для обновления поста
 */
const validateUpdatePost = [
  optionalText('text', 1, 2000, 'Некорректный текст'),

  body('type')
    .notEmpty()
    .isIn(['text', 'image', 'video'])
    .withMessage('Некорректный тип поста'),

  optionalText('postUrl', 10, 500, 'Некорректный URL поста'),

  optionalText('previewUrl', 10, 500, 'Некорректный URL превью'),

  optionalText('thumbnailUrl', 10, 500, 'Некорректный URL обложки'),

  body('isPublic')
    .isBoolean()
    .withMessage('Некорректный статус приватности')
    .bail()
    .toBoolean(),

  body('pinned')
    .optional()
    .isBoolean()
    .withMessage('Некорректный статус закрепления')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка обновления поста'),
];

module.exports = { validateUpdatePost };
