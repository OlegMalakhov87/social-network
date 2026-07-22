/**
 * Функция для проверки, является ли строка JSON-представлением расшаренной сущности.
 *
 * @param {string} text - строка для проверки
 * @param {string} [type] - конкретный тип для проверки 
 * @returns {boolean}
 */
export const isSharedEntity = (text, type) => {
  if (!text || typeof text !== 'string') return false;

  try {
    const obj = JSON.parse(text);
    if (!obj || !obj.type) return false;

    if (!type) return obj.type.startsWith('shared');

    return obj.type === type;
  } catch {
    return false;
  }
};
