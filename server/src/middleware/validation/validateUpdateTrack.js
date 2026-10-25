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
 * Проверяет поля обновления трека.
 */
const validateUpdateTrack = [
  optionalText('title', 1, 100, 'Некорректный заголовок'),

  optionalText('artist', 1, 100, 'Некорректная длина имени исполнителя'),

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
    .optional()
    .isInt({ min: 1, max: 1800 })
    .withMessage('Некорректная длительность видео')
    .bail()
    .toInt(),

  body('size')
    .optional()
    .isInt({ min: 1024 })
    .withMessage('Некорректный размер трека')
    .bail()
    .toInt(),

  optionalText('audioUrl', 10, 500, 'Некорректный URL аудио'),
  optionalText('coverUrl', 10, 500, 'Некорректный URL обложки'),

  optionalText('category', 1, 50, 'Некорректная категория'),

  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('Некорректный статус приватности')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка обновления трека'),
];

module.exports = { validateUpdateTrack };
