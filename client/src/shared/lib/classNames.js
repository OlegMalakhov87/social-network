/**
 * Объединяет классы в одну строку.
 *
 * @param {string[]} classes - массив классов.
 * @returns {string} - объединенные классы.
 */

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};