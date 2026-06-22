/* Функция для форматирования времени (реализовано для видео) */

export const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes.toString()).padStart(2, '0')}:${String(secs.toString()).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs.toString()).padStart(2, '0')}`;
};
