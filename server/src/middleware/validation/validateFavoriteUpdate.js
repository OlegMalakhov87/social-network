const { body } = require('express-validator');

const { validateErrors } = require('../../utils/validateErrors');

/**
 * Проверяет признак избранного.
 */
const validateFavoriteUpdate = [
  body('isFavorite')
    .isBoolean()
    .withMessage('Некорректный статус избранного')
    .bail()
    .toBoolean(),

  validateErrors('Ошибка обновления избранного'),
];

module.exports = {
  validateFavoriteUpdate,
};
