const { redis } = require('../lib/redis');
const { createError } = require('../utils/createError');
const {
  WEATHER_CODES,
  CACHE_TTL_1_HOUR,
  CACHE_TTL_24_HOURS,
} = require('../../config/weatherConfig');
const {
  isValidLatitude,
  isValidLongitude,
  getWeatherDisplay,
} = require('../utils/weatherUtils');

const weatherService = {
  /**
   * Получить название города по координатам.
   *
   * @param {number} lat - широта
   * @param {number} lon - долгота
   * @returns {Promise<string>} - название города
   */
  async getCityName(lat, lon) {
    try {
      /** URL для запроса к сервису геокодирования OpenStreetMap. */
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`;

      /** Запрос к сервису геокодирования OpenStreetMap. */
      const response = await fetch(url, {
        headers: {
          'User-Agent': `${process.env.APP_NAME}/${process.env.APP_VERSION} (${process.env.APP_CONTACT})`,
          'Accept-Language': 'ru',
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      const address = data?.address || null;

      /** Вспомогательная функция для очистки названия города. */
      const cleanCity = (name) => {
        if (!name) return null;
        return name
          .replace(/^городской округ\s+/i, '')
          .replace(/^муниципальный округ\s+/i, '')
          .replace(/^сельское поселение\s+/i, '')
          .trim();
      };

      /** Очищенное название города. */
      const city = cleanCity(
        address?.village ||
          address?.hamlet ||
          address?.city_district ||
          address?.municipality ||
          address?.town ||
          address?.city ||
          address?.state ||
          null
      );

      /** Возвращаем очищенное название города. */
      return city;
    } catch (error) {
      console.warn('Геокодирование не удалось:', error.message);
      return null;
    }
  },

  /**
   * Получить погоду по координатам.
   *
   * @param {number} lat - широта
   * @param {number} lon - долгота
   * @returns {Promise<Object>} - объект с погодой
   */
  async getWeatherByCoords(lat, lon) {
    /** Проверяем, что координаты валидны. */
    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      throw createError('Некорректные координаты', 400, 'INVALID_COORDS');
    }

    // Округление координат для стабильного ключа кэша
    const roundedLat = lat.toFixed(2);
    const roundedLon = lon.toFixed(2);

    /** Ключ для кэша погоды. */
    const cacheKey = `weather:coords:${roundedLat},${roundedLon}`;

    /** Проверяем, есть ли данные в кэше. */
    const cached = await redis.get(cacheKey);

    /** Если данные есть в кэше, возвращаем их. */
    if (cached) return JSON.parse(cached);

    /** Ключ для кэша названия города. */
    const cityCacheKey = `city:${roundedLat},${roundedLon}`;

    /** Получаем название города из кэша. */
    let cityLabel = await redis.get(cityCacheKey);

    /** Если название города не в кэше, получаем его из сервиса геокодирования. */
    if (!cityLabel) {
      cityLabel = await this.getCityName(lat, lon);

      /** Если название города получено, сохраняем его в кэш. */
      if (cityLabel)
        await redis.setex(cityCacheKey, CACHE_TTL_24_HOURS, cityLabel);
    }

    /** URL для запроса к API Open-Meteo. */
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&daily=sunrise,sunset&timezone=auto`;

    /** Запрос к API Open-Meteo. */
    const response = await fetch(url);

    /** Если не удалось получить данные, выбрасываем ошибку. */
    if (!response.ok) {
      throw createError('Не удалось получить погоду', 502, 'WEATHER_API_ERROR');
    }

    /** Получаем данные из ответа. */
    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    /** Получаем информацию о погоде из маппинга WEATHER_CODES. */
    const weatherInfo = getWeatherDisplay(
      current.weather_code,
      current.is_day,
      WEATHER_CODES
    );

    /** Формируем результат. */
    const result = {
      city: cityLabel || 'Текущее местоположение',
      temp: Math.round(current.temperature_2m),
      icon: weatherInfo.icon,
      label: weatherInfo.label,
      windSpeed: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.pressure_msl * 0.750062),
      sunrise: daily.sunrise[0],
      sunset: daily.sunset[0],
      updatedAt: new Date().toISOString(),
    };

    /** Сохраняем результат в кэш. */
    await redis.setex(cacheKey, CACHE_TTL_1_HOUR, JSON.stringify(result));

    return result;
  },
};

module.exports = weatherService;
