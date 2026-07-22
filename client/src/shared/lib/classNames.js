/**
 * Функция для объединения классов в одну строку.
 *
 * @param {string} classes - классы для объединения.
 * @returns {string} - объединенные классы.
 */

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
