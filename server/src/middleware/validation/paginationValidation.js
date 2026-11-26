const { query } = require('express-validator');

const { validateErrors } = require('../../utils/validateErrors');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

/**
 * Проверяет и нормализует параметры пагинации.
 *
 * - page: целое ≥ 1, по умолчанию 1
 * - limit: целое от 1 до 100, по умолчанию 30
 *
 * После middleware req.query.page и req.query.limit — числа.
 * До контроллера доходят только валидные значения.
 *
 * @returns {import('express').RequestHandler[]} Цепочка проверок.
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page должен быть целым числом ≥ 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: MAX_LIMIT })
    .withMessage(`limit должен быть целым числом от 1 до ${MAX_LIMIT}`)
    .toInt(),

  validateErrors('Ошибка параметров пагинации'),

  // Явно проставляем дефолты числами — не полагаемся на Number() в контроллерах.
  (req, _res, next) => {
    const page = req.query.page ?? DEFAULT_PAGE;
    const limit = req.query.limit ?? DEFAULT_LIMIT;

    Object.defineProperty(req, 'query', {
      value: { ...req.query, page, limit },
      writable: true,
      configurable: true,
      enumerable: true,
    });

    next();
  },
];

module.exports = { validatePagination, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT };
