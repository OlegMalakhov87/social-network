/**
 * Форматирует дату в формате ISO в формат для input
 * @param {string} isoDate - Дата в формате ISO
 * @returns {string} - Дата в формате для input
 */
export const formatDateForInput = (isoDate) => {
  if (!isoDate) return null;
  return isoDate.slice(0, 10);
};
