const LOCALE = 'ru-RU';

const ONE_DAY_MS = 86_400_000;
const ONE_YEAR_MS = 31_536_000_000;

/**
 * Форматирует дату с учётом давности.
 *
 * @param {number|string} timestamp - Метка времени в миллисекундах или строка даты
 * @returns {string} Время, краткая дата или пустая строка.
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();

  if (diff < ONE_DAY_MS) {
    return date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
  }

  if (diff < ONE_YEAR_MS) {
    return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
  }

  return date.toLocaleDateString(LOCALE, { month: 'short', year: 'numeric' });
};
