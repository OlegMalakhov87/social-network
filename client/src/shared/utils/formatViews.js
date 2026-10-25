/**
 * Сокращает большое количество просмотров.
 *
 * @param {number} views - Количество просмотров
 * @returns {string} Сокращённое количество или «0».
 */
export const formatViews = (views) => {
  if (views == null || isNaN(views)) return '0';
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} млн`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} тыс`;
  return String(views);
};
