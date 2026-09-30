/**
 * Форматирует время в указанной таймзоне.
 *
 * @param {string} timezone - IANA-таймзона (например, 'Europe/Moscow')
 * @returns {string} - время в формате HH:MM
 */
export const formatCityTime = (timezone) => {
  if (!timezone) return '';
  try {
    return new Date().toLocaleTimeString('ru-RU', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};
