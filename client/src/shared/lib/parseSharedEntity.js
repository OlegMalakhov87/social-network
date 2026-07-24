/**
 * Безопасно парсит расшаренную сущность из строки или объекта.
 *
 * @param {string|Object} data - строка JSON или готовый объект
 * @returns {Object|null} - распарсенный объект или null
 */
export const parseSharedEntity = (data) => {
  if (!data) return null;

  // Уже объект — возвращаем как есть
  if (typeof data === 'object') return data;

  // Строка — парсим
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  return null;
};