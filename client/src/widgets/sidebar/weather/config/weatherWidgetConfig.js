/** Содержит поля ветра, влажности и давления. */
export const WEATHER_META_FIELDS = [
  {
    key: 'wind',
    label: 'Ветер',
    /**
     * Возвращает скорость ветра.
     *
     * @param {Object} weather - Данные о погоде
     * @returns {string} Скорость ветра.
     */
    getValue: (weather) =>
      typeof weather?.windSpeed === 'number'
        ? `${Math.round(weather.windSpeed)} м/с`
        : '—',
  },
  {
    key: 'humidity',
    label: 'Влажность',
    /**
     * Возвращает влажность воздуха.
     *
     * @param {Object} weather - Данные о погоде
     * @returns {string} Влажность воздуха.
     */
    getValue: (weather) =>
      typeof weather?.humidity === 'number' ? `${weather.humidity}%` : '—',
  },
  {
    key: 'pressure',
    label: 'Давление',
    /**
     * Возвращает атмосферное давление.
     *
     * @param {Object} weather - Данные о погоде
     * @returns {string} Атмосферное давление.
     */
    getValue: (weather) =>
      typeof weather?.pressure === 'number'
        ? `${Math.round(weather.pressure)} мм рт. ст.`
        : '—',
  },
];

/** Содержит поля времени рассвета и заката. */
export const WEATHER_SUN_FIELDS = [
  {
    key: 'sunrise',
    icon: '🌅',
    label: 'Рассвет',
    /**
     * Возвращает время рассвета.
     *
     * @param {Object} weather - Данные о погоде
     * @returns {string} Время рассвета.
     */
    getValue: (weather) => (weather?.sunrise ? weather.sunrise.slice(11, 16) : '—'),
  },
  {
    key: 'sunset',
    icon: '🌇',
    label: 'Закат',
    /**
     * Возвращает время заката.
     *
     * @param {Object} weather - Данные о погоде
     * @returns {string} Время заката.
     */
    getValue: (weather) => (weather?.sunset ? weather.sunset.slice(11, 16) : '—'),
  },
];
