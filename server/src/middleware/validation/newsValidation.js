const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для новости
 */
const validateNews = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна заголовка'),

  body('text')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Некорректная длинна текста'),

  body('category')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Категория обязательна'),

  body('type')
    .notEmpty()
    .isIn(['text', 'image', 'video'])
    .withMessage('Некорректный тип новости'),

  body('source')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна источника'),

  body('newsUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL новости'),

  body('previewUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL превью'),

  body('thumbnailUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL обложки'),

  validateErrors('Ошибка добавления новости'),
];

module.exports = {
  validateNews,
};
