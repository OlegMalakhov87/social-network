const { body } = require('express-validator');

const { validateErrors } = require('../../utils/validateErrors');

/**
 * Проверяет признак публичности профиля.
 */
const validatePrivacyUpdate = [
  body('isPublic')
    .isBoolean()
    .withMessage('Некорректный статус приватности')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка обновления приватности пользователя'),
];

module.exports = {
  validatePrivacyUpdate,
};
