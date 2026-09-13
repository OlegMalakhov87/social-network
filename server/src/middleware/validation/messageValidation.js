const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для сообщений
 */

const validateMessage = [
  body('receiverId')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Некорректный ID получателя'),

  body('senderId')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Некорректный ID отправителя'),

  body('content')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Некорректная длинна сообщения'),

  validateErrors('Ошибка отправки сообщения'),
];

module.exports = { validateMessage };
