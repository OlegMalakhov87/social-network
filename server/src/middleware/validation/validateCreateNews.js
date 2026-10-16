const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

const requiredText = (field, min, max, message) =>
  body(field)
    .isString()
    .withMessage(message)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(message)
    .bail()
    .isLength({ min, max })
    .withMessage(message);

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
 * Валидация для новости
 */
const validateCreateNews = [
  requiredText('title', 1, 100, 'Некорректный длина заголовка'),

  requiredText('text', 1, 5000, 'Некорректная длина текста'),

  requiredText('category', 1, 50, 'Некорректная категория'),

  body('type')
    .notEmpty()
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

  validateErrors('Ошибка добавления новости'),
];

module.exports = {
  validateCreateNews,
};
