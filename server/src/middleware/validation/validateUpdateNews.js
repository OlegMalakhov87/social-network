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
    .optional()
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
 * Проверяет необязательный URL длиной от 10 до 500 символов.
 *
 * @param {string} field - Имя поля
 * @param {string} message - Текст ошибки для пользователя
 * @returns {import('express-validator').ValidationChain} Цепочка проверки поля.
 */
const optionalUrl = (field, message) =>
  body(field)
    .optional({ nullable: true })
    .isString()
    .withMessage(message)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(message)
    .bail()
    .isLength({ min: 10, max: 500 })
    .withMessage(message);

/**
 * Проверяет поля обновления новости.
 */
const validateUpdateNews = [
  optionalText('title', 1, 100, 'Некорректный заголовок'),

  optionalText('text', 1, 5000, 'Некорректный текст'),

  optionalText('category', 1, 50, 'Некорректная категория'),

  body('type')
    .optional()
    .isIn(['text', 'image', 'video'])
    .withMessage('Некорректный тип новости'),

  body('source')
    .optional({ nullable: true })
    .isString()
    .withMessage('Некорректный источник')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Некорректный источник')
    .bail()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длина источника новости'),

  optionalUrl('newsUrl', 'Некорректный URL новости'),

  optionalUrl('previewUrl', 'Некорректный URL превью'),

  optionalUrl('thumbnailUrl', 'Некорректный URL обложки'),

  validateErrors('Ошибка обновления новости'),
];

module.exports = {
  validateUpdateNews,
};
