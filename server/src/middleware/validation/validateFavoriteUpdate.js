const { body } = require('express-validator');
const { validateErrors } = require('../../utils/validateErrors');

/**
 * Валидация для обновления избранного
 */
const validateFavoriteUpdate = [
  body('isFavorite').isBoolean().withMessage('Некорректный статус избранного'),

  validateErrors('Ошибка обновления избранного'),
];

module.exports = {
  validateFavoriteUpdate,
};
