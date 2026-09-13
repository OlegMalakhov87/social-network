const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для видео
 */
const validateVideo = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна заголовка'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Некорректная длинна описания'),

  body('duration')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1800 })
    .toInt()
    .withMessage('Некорректная длительность'),

  body('size')
    .optional({ nullable: true })
    .isInt({ min: 1024 })
    .toInt()
    .withMessage('Некорректный размер'),

  body('year')
    .optional({ nullable: true })
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .toInt()
    .withMessage('Некорректный год'),

  body('videoUrl')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL видео '),

  body('thumbnailUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL обложки '),

  body('previewUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL превью'),

  body('category')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Некорректная длинна категории'),

  body('isPublic')
    .notEmpty()
    .isBoolean()
    .withMessage('Некорректный статус приватности'),

  validateErrors('Ошибка добавления видео'),
];

module.exports = {
  validateVideo,
};
