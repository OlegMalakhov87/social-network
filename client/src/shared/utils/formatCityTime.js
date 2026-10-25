/**
 * Возвращает текущее время в заданном часовом поясе.
 *
 * @param {string} timezone - Название часового пояса
 * @returns {string} Время в формате ЧЧ:ММ или пустая строка.
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
