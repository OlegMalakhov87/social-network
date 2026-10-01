
/** Проверяет, является ли широта валидной. */
const isValidLatitude = (lat) =>
  Number.isFinite(lat) && lat >= -90 && lat <= 90;

/** Проверяет, является ли долгота валидной. */
const isValidLongitude = (lon) =>
  Number.isFinite(lon) && lon >= -180 && lon <= 180;

/** Парсит координату из строки. */
const parseCoordinate = (value) => {
  if (typeof value !== 'string' || !value.trim()) return NaN;

  return Number(value);
};

/** Получает отображение погоды по коду. */
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
