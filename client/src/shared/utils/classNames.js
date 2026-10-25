/**
 * Объединяет имена классов CSS в одну строку.
 *
 * @param {...*} classes - Имена классов и пустые значения
 * @returns {string} Строка из непустых имён классов.
 */
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
