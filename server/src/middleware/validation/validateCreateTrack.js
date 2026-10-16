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

/**
 * Валидация для создания трека
 */
const validateCreateTrack = [
  requiredText('title', 1, 100, 'Некорректная длина заголовка'),

  requiredText('artist', 1, 100, 'Некорректная длина имени исполнителя'),

  body('album')
    .optional({ nullable: true })
    .isString()
    .withMessage('Некорректное название альбома')
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длина названия альбома'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Некорректное описание')
    .bail()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Некорректная длина описания'),

  body('duration')
    .isInt({ min: 1, max: 600 })
    .withMessage('Некорректная длительность трека')
    .bail()
    .toInt(),

  body('size')
    .isInt({ min: 1024 })
    .withMessage('Некорректный размер трека')
    .bail()
    .toInt(),

  requiredText('audioUrl', 10, 500, 'Не указан URL аудио'),

  body('coverUrl')
    .optional({ nullable: true })
    .isString()
    .withMessage('Некорректный URL обложки')
    .bail()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Некорректная длинна URL обложки'),

  requiredText('category', 1, 50, 'Некорректная категория'),

  body('isPublic')
    .isBoolean()
    .withMessage('Некорректный статус приватности')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка добавления трека'),
];

module.exports = { validateCreateTrack };
