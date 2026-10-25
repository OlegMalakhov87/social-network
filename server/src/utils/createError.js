/**
 * Создает ошибку с кодом состояния и машинным кодом.
 *
 * @param {string} message - Текст ошибки для пользователя
 * @param {number} [statusCode=500] - Код состояния HTTP
 * @param {string|null} [code=null] - Машинный код ошибки
 * @returns {Error} Ошибка с полями statusCode и code.
 */
const createError = (message, statusCode = 500, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

module.exports = { createError };
