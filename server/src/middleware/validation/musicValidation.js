const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для музыки
 */
const validateMusic = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна заголовка'),

  body('artist')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна имени исполнителя'),

  body('album')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна названия альбома'),

  body('description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Некорректная длинна описания'),

  body('year')
    .optional({ nullable: true })
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .toInt()
    .withMessage('Некорректный год'),

  body('duration')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 600 })
    .toInt()
    .withMessage('Некорректная длительность трека'),

  body('audioUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL аудио'),

  body('coverUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL обложки'),

  body('category')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Некорректная длинна категории'),

  body('isPublic')
    .isBoolean()
    .withMessage('Некорректный статус приватности'),

  validateErrors('Ошибка добавления трека'),
];

module.exports = { validateMusic };
