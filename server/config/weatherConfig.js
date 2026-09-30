/** Время жизни кэша — 10 минут. */
const CACHE_TTL = 10 * 60;

/** Маппинг WMO-кодов в эмодзи и описание. */
const WEATHER_CODES = {
  0: { icon: { day: '☀️', night: '🌙' }, label: 'Ясно' },
  1: { icon: { day: '🌤️', night: '🌥️' }, label: 'Преимущественно ясно' },
  2: { icon: { day: '⛅', night: '☁️' }, label: 'Переменная облачность' },
  3: { icon: { day: '☁️', night: '☁️' }, label: 'Пасмурно' },
  45: { icon: { day: '🌫️', night: '🌫️' }, label: 'Туман' },
  48: { icon: { day: '🌫️', night: '🌫️' }, label: 'Изморозь' },
  51: { icon: { day: '🌦️', night: '🌧️' }, label: 'Лёгкая морось' },
  53: { icon: { day: '🌦️', night: '🌧️' }, label: 'Морось' },
  55: { icon: { day: '🌧️', night: '🌧️' }, label: 'Сильная морось' },
  56: { icon: { day: '🥶', night: '🥶' }, label: 'Слабая ледяная морось' },
  57: { icon: { day: '🥶', night: '🥶' }, label: 'Сильная ледяная морось' },
  61: { icon: { day: '🌧️', night: '🌧️' }, label: 'Небольшой дождь' },
  63: { icon: { day: '🌧️', night: '🌧️' }, label: 'Дождь' },
  65: { icon: { day: '🌧️', night: '🌧️' }, label: 'Сильный дождь' },
  66: { icon: { day: '🥶', night: '🥶' }, label: 'Слабый ледяной дождь' },
  67: { icon: { day: '🥶', night: '🥶' }, label: 'Сильный ледяной дождь' },
  71: { icon: { day: '🌨️', night: '🌨️' }, label: 'Небольшой снег' },
  73: { icon: { day: '🌨️', night: '🌨️' }, label: 'Снег' },
  75: { icon: { day: '❄️', night: '❄️' }, label: 'Сильный снег' },
  77: { icon: { day: '🌨️', night: '🌨️' }, label: 'Снежная крупа' },
  80: { icon: { day: '🌦️', night: '🌧️' }, label: 'Ливень' },
  81: { icon: { day: '🌧️', night: '🌧️' }, label: 'Сильный ливень' },
  82: { icon: { day: '⛈️', night: '⛈️' }, label: 'Очень сильный ливень' },
  85: { icon: { day: '🌨️', night: '🌨️' }, label: 'Слабый ливневый снег' },
  86: { icon: { day: '❄️', night: '❄️' }, label: 'Сильный ливневый снег' },
  95: { icon: { day: '⛈️', night: '⛈️' }, label: 'Гроза' },
  96: { icon: { day: '⛈️', night: '⛈️' }, label: 'Гроза с небольшим градом' },
  99: { icon: { day: '⛈️', night: '⛈️' }, label: 'Сильная гроза с градом' },
};

module.exports = {
  CACHE_TTL,
  WEATHER_CODES,
};
