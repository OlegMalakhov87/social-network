const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

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
 * Валидация для обновления видео
 */
const validateUpdateVideo = [
  optionalText('title', 1, 100, 'Некорректный заголовок'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Некорректное описание')
    .bail()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Некорректная длина описания'),

  body('duration')
    .optional()
    .isInt({ min: 1, max: 1800 })
    .withMessage('Некорректная длительность видео')
    .bail()
    .toInt(),

  body('size')
    .optional()
    .isInt({ min: 1024 })
    .withMessage('Некорректный размер видео')
    .bail()
    .toInt(),

  optionalText('videoUrl', 500, 'Некорректный URL видео'),
  optionalText('previewUrl', 500, 'Некорректный URL превью'),
  optionalText('thumbnailUrl', 500, 'Некорректный URL обложки'),

  optionalText('category', 50, 'Некорректная категория'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Некорректный статус приватности')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка обновления видео'),
];

module.exports = { validateUpdateVideo };
