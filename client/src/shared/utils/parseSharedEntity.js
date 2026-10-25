/**
 * Разбирает переданную сущность из строки JSON или объекта.
 *
 * @param {string|Object|null|undefined} data - Строка JSON или объект
 * @returns {Object|null} Разобранная сущность или null.
 */
export const parseSharedEntity = (data) => {
  if (!data) return null;

  if (typeof data === 'object') return data;

  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  return null;
};
