/**
 * Проверяет, что широта входит в диапазон от -90 до 90.
 *
 * @param {number} lat - Широта
 * @returns {boolean} Признак допустимой широты.
 */
const isValidLatitude = (lat) =>
  Number.isFinite(lat) && lat >= -90 && lat <= 90;

/**
 * Проверяет, что долгота входит в диапазон от -180 до 180.
 *
 * @param {number} lon - Долгота
 * @returns {boolean} Признак допустимой долготы.
 */
const isValidLongitude = (lon) =>
  Number.isFinite(lon) && lon >= -180 && lon <= 180;

/**
 * Преобразует строку координаты в число.
 *
 * @param {string} value - Строка координаты
 * @returns {number} Число или NaN, если строка пуста или не является числом.
 */
const parseCoordinate = (value) => {
  if (typeof value !== 'string' || !value.trim()) return NaN;

  return Number(value);
};

/**
 * Возвращает значок и подпись погоды по коду WMO.
 *
 * @param {number} code - Код погоды WMO
 * @param {number} isDayValue - Признак дня: 1 для дня
 * @param {Object<number, {icon: {day: string, night: string}, label: string}>} weatherCodes - Справочник кодов погоды
 * @returns {{icon: string, label: string}} Значок и подпись.
 */
const getWeatherDisplay = (code, isDayValue, weatherCodes) => {
  const config = weatherCodes[code] || {
    icon: { day: '🌡️', night: '🌡️' },
    label: 'Неизвестные условия',
  };

  return {
    icon: config.icon[isDayValue === 1 ? 'day' : 'night'],
    label: config.label,
  };
};

module.exports = {
  isValidLatitude,
  isValidLongitude,
  getWeatherDisplay,
  parseCoordinate,
};
