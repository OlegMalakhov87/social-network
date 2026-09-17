const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для постов
 */
const validatePost = [
  body('text')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Некорректная длинна текста'),

  body('type')
    .notEmpty()
    .isIn(['text', 'image', 'video'])
    .withMessage('Некорректный тип поста'),

  body('postUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректный URL поста'),

  body('previewUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректный URL превью'),

  body('thumbnailUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректный URL обложки'),

  body('isPublic').isBoolean().withMessage('Некорректный статус приватности'),

  body('pinned')
    .isBoolean()
    .withMessage('Некорректный статус поля "Закрепить"'),

  validateErrors('Ошибка создания поста'),
];

module.exports = { validatePost };
