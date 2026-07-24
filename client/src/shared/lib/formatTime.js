/**
 * Функция для форматирования времени.
 *
 * @param {number} seconds - время в секундах.
 * @returns {string} - форматированное время.
 */

export const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(mins.toString()).padStart(2, '0')}:${String(secs.toString()).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs.toString()).padStart(2, '0')}`;
};
