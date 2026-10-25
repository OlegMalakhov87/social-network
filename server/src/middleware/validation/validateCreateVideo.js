const { body } = require('express-validator');

const { validateErrors } = require('../../utils/validateErrors');

/**
 * Проверяет обязательную строку заданной длины.
 *
 * @param {string} field - Имя поля
 * @param {number} min - Минимальная длина
 * @param {number} max - Максимальная длина
 * @param {string} message - Текст ошибки для пользователя
 * @returns {import('express-validator').ValidationChain} Цепочка проверки поля.
 */
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
     * Проверяет поля нового видео.
     */
const validateCreateVideo = [
  requiredText('title', 1, 100, 'Некорректный длина заголовка'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Некорректное описание')
    .bail()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Некорректная длина описания'),

  body('duration')
    .isInt({ min: 1, max: 1800 })
    .withMessage('Некорректная длительность видео')
    .bail()
    .toInt(),

  body('size')
    .isInt({ min: 1024 })
    .withMessage('Некорректный размер видео')
    .bail()
    .toInt(),

  requiredText('videoUrl', 10, 500, 'Не указан URL видео'),
  requiredText('previewUrl', 10, 500, 'Не указан URL превью'),
  requiredText('thumbnailUrl', 10, 500, 'Не указан URL обложки'),

  requiredText('category', 1, 50, 'Некорректная категория'),

  body('isPublic')
    .isBoolean()
    .withMessage('Некорректный статус приватности')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка добавления видео'),
];

module.exports = { validateCreateVideo };
