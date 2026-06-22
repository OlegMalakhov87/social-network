/* Функция для форматирования времени (реализовано для треков) */

export const formatTimeAudio = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs.toString()).padStart(2, '0')}`;
};
