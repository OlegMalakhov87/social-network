/**
 * Фабрика ошибок. Создает объект Error с дополнительными полями
 * для корректной обработки в errorMiddleware.
 *
 * @param {string} message - Человекочитаемое сообщение
 * @param {number} statusCode - HTTP статус (400, 401, 404, 409...)
 * @param {string} [code] - Машинный код ошибки (для фронтенда)
 */
const createError = (message, statusCode = 500, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

module.exports = createError;