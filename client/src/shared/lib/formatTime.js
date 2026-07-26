/**
 * Форматирует длительность в секундах в строку вида "м:сс" или "ч:мм:сс".
 *
 * @param {number} seconds - время в секундах
 * @returns {string} - форматированное время
 */
export const formatTime = (seconds) => {
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
