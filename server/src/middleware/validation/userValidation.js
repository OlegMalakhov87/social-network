const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для регистрации пользователя
 */
const validateRegister = [
  body('name')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна имени'),

  body('email')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 5, max: 55 })
    .withMessage('Некорректный email'),

  body('password')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Некорректная длинна пароля'),

  body('gender')
    .notEmpty()
    .isIn(['male', 'female'])
    .withMessage('Некорректный пол'),

  validateErrors('Ошибка регистрации'),
];

/**
 * Валидация для входа в систему
 */
const validateLogin = [
  body('email')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 5, max: 55 })
    .withMessage('Некорректный email'),

  body('password')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Некорректная длинна пароля'),

  validateErrors('Ошибка входа в систему'),
];

/**
 * Валидация для обновления пользователя
 */
const validateUser = [
  body('name')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна имени'),

  body('avatarUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна URL аватара'),

  body('nickname')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна никнейма'),

  body('birthDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('Некорректное значение даты'),

  body('email')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .isLength({ min: 5, max: 55 })
    .withMessage('Некорректный email'),

  body('address')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна поля "адрес"'),

  body('job')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Некорректная длинна поля "работа"'),

  body('status')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Некорректная длинна поля "статус"'),

  body('phone')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('Некорректная длинна номера телефона'),

  validateErrors('Ошибка обновления пользователя'),
];

/**
 * Валидация для изменения пароля пользователя
 */
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Некорректная длинна текущего пароля'),

  body('newPassword')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Некорректная длинна нового пароля'),

  validateErrors('Ошибка изменения пароля'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUser,
  validatePasswordChange,
};
