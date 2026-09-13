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
    .withMessage('Текст от 1 до 5000 символов'),

  body('type')
    .notEmpty()
    .isIn(['text', 'image', 'video'])
    .withMessage('Тип должен быть text, image или video'),

  body('postUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Пост до 500 символов'),

  body('previewUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Превью до 500 символов'),

  body('thumbnailUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Обложка до 500 символов'),

  body('isPublic')
    .notEmpty()
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),

  body('pinned')
    .notEmpty()
    .isBoolean()
    .withMessage('pinned должен быть true или false'),

  validateErrors('Ошибка создания поста'),
];

module.exports = { validatePost };
