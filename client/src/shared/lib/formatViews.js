/**
 * Форматирует количество просмотров/прослушиваний в сокращённую строку.
 *
 * @param {number} views - количество
 * @returns {string} - форматированное значение
 */
export const formatViews = (views) => {
  if (views == null || isNaN(views)) return '0';
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} млн`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} тыс`;
  return String(views);
};
