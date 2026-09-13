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
    .withMessage('Имя от 1 до 100 символов'),

  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),

  body('password')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Пароль от 6 до 128 символов'),

  body('gender')
    .notEmpty()
    .isIn(['male', 'female'])
    .withMessage('Пол должен быть male или female'),

  validateErrors('Ошибка регистрации'),
];

/**
 * Валидация для входа в систему
 */
const validateLogin = [
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),

  body('password')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Пароль от 6 до 128 символов'),

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
    .withMessage('Имя от 1 до 100 символов'),

  body('avatarUrl')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Аватар URL до 500 символов'),

  body('nickname')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Никнейм от 1 до 100 символов'),

  body('birthDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('Некорректная дата'),

  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),

  body('address')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Адрес до 500 символов'),

  body('job')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Должность до 100 символов'),

  body('status')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Статус до 500 символов'),

  body('phone')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage('Телефон от 1 до 25 символов'),

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
    .isLength({ min: 6 })
    .withMessage('Введите текущий пароль от 6 символов'),

  body('newPassword')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 6, max: 128 })
    .withMessage('Введите новый пароль от 6 до 128 символов'),

  validateErrors('Ошибка изменения пароля'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUser,
  validatePasswordChange,
};
