/** Массив полей для мета информации о погоде. */
export const WEATHER_META_FIELDS = [
  {
    key: 'wind',
    label: 'Ветер',
    getValue: (weather) =>
      typeof weather?.windSpeed === 'number'
        ? `${Math.round(weather.windSpeed)} м/с`
        : '—',
  },
  {
    key: 'humidity',
    label: 'Влажность',
    getValue: (weather) =>
      typeof weather?.humidity === 'number' ? `${weather.humidity}%` : '—',
  },
  {
    key: 'pressure',
    label: 'Давление',
    getValue: (weather) =>
      typeof weather?.pressure === 'number'
        ? `${Math.round(weather.pressure)} мм рт. ст.`
        : '—',
  },
];

/** Массив полей для информации о солнце. */
export const WEATHER_SUN_FIELDS = [
  {
    key: 'sunrise',
    icon: '🌅',
    label: 'Рассвет',
    getValue: (weather) => (weather?.sunrise ? weather.sunrise.slice(11, 16) : '—'),
  },
  {
    key: 'sunset',
    icon: '🌇',
    label: 'Закат',
    getValue: (weather) => (weather?.sunset ? weather.sunset.slice(11, 16) : '—'),
  },
];
