const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для обновления приватности пользователя
 */
const validatePrivacyUpdate = [
  body('isPublic').isBoolean().withMessage('Некорректный статус приватности'),

  validateErrors('Ошибка обновления приватности пользователя'),
];

module.exports = {
  validatePrivacyUpdate,
};
