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
 * Проверяет необязательную строку, включая значение null.
 *
 * @param {string} field - Имя поля
 * @param {number} min - Минимальная длина
 * @param {number} max - Максимальная длина
 * @param {string} message - Текст ошибки для пользователя
 * @returns {import('express-validator').ValidationChain} Цепочка проверки поля.
 */
const optionalBody = (field, min, max, message) =>
  body(field)
    .optional({ nullable: true })
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
 * Проверяет поля регистрации.
 */
const validateRegister = [
  requiredText('name', 1, 100, 'Некорректная длинна имени'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 55 })
    .withMessage('Некорректный email'),

  requiredText('password', 6, 128, 'Некорректная длинна пароля'),

  body('gender')
    .notEmpty()
    .isIn(['male', 'female'])
    .withMessage('Некорректный пол'),

  validateErrors('Ошибка регистрации'),
];

/**
 * Проверяет поля входа.
 */
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 55 })
    .withMessage('Некорректный email'),

  requiredText('password', 6, 128, 'Некорректная длинна пароля'),

  validateErrors('Ошибка входа в систему'),
];

/**
 * Проверяет поля обновления профиля.
 */
const validateUser = [
  optionalText('name', 1, 100, 'Некорректная длинна имени'),

  optionalBody('avatarUrl', 10, 500, 'Некорректная длинна URL аватара'),

  optionalBody('nickname', 1, 100, 'Некорректная длинна никнейма'),

  body('birthDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('Некорректное значение даты'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .trim()
    .isLength({ min: 5, max: 55 })
    .withMessage('Некорректный email'),

  optionalBody('address', 1, 500, 'Некорректная длинна поля "адрес"'),

  optionalBody('job', 1, 100, 'Некорректная длинна поля "работа"'),

  optionalBody('status', 1, 500, 'Некорректная длинна поля "статус"'),

  optionalBody('phone', 1, 25, 'Некорректная длинна номера телефона'),

  validateErrors('Ошибка обновления пользователя'),
];

/**
 * Проверяет текущий и новый пароль.
 */
const validatePasswordChange = [
  requiredText(
    'currentPassword',
    6,
    128,
    'Некорректная длинна текущего пароля'
  ),

  requiredText('newPassword', 6, 128, 'Некорректная длинна нового пароля'),

  validateErrors('Ошибка изменения пароля'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUser,
  validatePasswordChange,
};
