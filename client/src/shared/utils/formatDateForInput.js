/**
 * Возвращает дату для поля ввода.
 *
 * @param {string} isoDate - Дата в виде строки
 * @returns {string|null} Первые десять символов или null, если дата пуста.
 */
export const formatDateForInput = (isoDate) => {
  if (!isoDate) return null;
  return isoDate.slice(0, 10);
};
