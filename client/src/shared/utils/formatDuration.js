/**
 * Форматирует длительность в часы, минуты и секунды.
 *
 * @param {number} seconds - Длительность в секундах
 * @returns {string} Строка вида «ч:мм:сс», «м:сс» или «0:00».
 */
export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${mins}:${String(secs).padStart(2, '0')}`;
};
