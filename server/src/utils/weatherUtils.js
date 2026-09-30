/** Нормализует город из строки адреса. */
const normalizeCity = (address) => {
  if (!address) return null;

  return address.split(',')[0].trim().toLowerCase();
};

/** Получает город в пользовательском виде из строки адреса. */
const getCityLabel = (address) => {
  if (!address) return null;

  return address.split(',')[0].trim() || null;
};

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
  normalizeCity,
  getCityLabel,
  isValidLatitude,
  isValidLongitude,
  getWeatherDisplay,
  parseCoordinate,
};
