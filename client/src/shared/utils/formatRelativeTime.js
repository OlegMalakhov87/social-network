/**
 * Форматирует дату относительно текущего момента.
 *
 * @param {string} dateString - Строка даты
 * @param {number} [now=Date.now()] - Текущее время в миллисекундах
 * @returns {string} Относительное время или пустая строка.
 */
export const formatRelativeTime = (dateString, now = Date.now()) => {
  if (!dateString) return '';

  const date = new Date(dateString).getTime();
  const diff = Math.max(0, now - date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days === 1) return 'вчера';
  return `${days} дн назад`;
};
