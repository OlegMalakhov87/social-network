/**
 * Отбирает из тела запроса поля с непустыми медиа-URL.
 *
 * @param {Object} body - Тело запроса
 * @param {string[]} fields - Список допустимых полей
 * @returns {Array<{url: string, fieldName: string}>} Список полей для удаления
 */
const pickMediaFields = (body, fields) =>
  fields
    .filter((field) => typeof body?.[field] === 'string' && body[field].trim())
    .map((field) => ({ url: body[field], fieldName: field }));

module.exports = { pickMediaFields };
