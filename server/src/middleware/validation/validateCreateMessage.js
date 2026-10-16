const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для сообщений
 */

const validateCreateMessage = [
  body('receiverId')
    .notEmpty()
    .withMessage('ID получателя обязателен')
    .isInt({ min: 1 })
    .withMessage('ID получателя должен быть числом больше 0')
    .toInt(),

  body('content')
    .notEmpty()
    .withMessage('Сообщение не может быть пустым')
    .isString()
    .withMessage('Сообщение должно быть строкой')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Сообщение от 1 до 2000 символов'),

  validateErrors('Ошибка отправки сообщения'),
];

module.exports = { validateCreateMessage };
