const { body } = require('express-validator');

const { validateErrors } = require('../../utils/validateErrors');

/**
 * Проверяет необязательную строку заданной длины.
 *
 * @param {string} field - Имя поля
 * @param {number} min - Минимальная длина
 * @param {number} max - Максимальная длина
 * @param {string} message - Текст ошибки для пользователя
 * @returns {import('express-validator').ValidationChain} Цепочка проверки поля.
 */
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
 * Проверяет поля нового поста.
 */
const validateCreatePost = [
  optionalText('text',1,2000, 'Некорректный текст'),

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
    .isBoolean()
    .withMessage('Некорректный статус закрепления')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка создания поста'),
];

module.exports = { validateCreatePost };
