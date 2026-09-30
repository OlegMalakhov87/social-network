const { redis } = require('../lib/redis');
const { createError } = require('../utils/createError');
const { WEATHER_CODES, CACHE_TTL } = require('../../config/weatherConfig');
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
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ru`;

      // Делаем запрос к бесплатному сервису геокодирования OpenStreetMap
      const response = await fetch(url, {
        headers: {
          'User-Agent': `${process.env.APP_NAME}/${process.env.APP_VERSION} (${process.env.APP_CONTACT})`,
          'Accept-Language': 'ru',
        },
      });

      if (!response.ok) return null; // Если не удалось получить данные, возвращаем null

      const data = await response.json();
      const address = data?.address || null;

      console.log('OpenStreetMap response', address);

      const cleanCity = (name) => {
        if (!name) return null;
        return name
          .replace(/^городской округ\s+/i, '')
          .replace(/^муниципальный округ\s+/i, '')
          .replace(/^сельское поселение\s+/i, '')
          .trim();
      };

      const city = cleanCity(
        address.village ||
          address.hamlet ||
          address.city_district ||
          address.municipality ||
          address.city ||
          address.state ||
          null
      );

      // В зависимости от типа населенного пункта берем город, поселок или деревню
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
   * @param {string} address - адрес
   * @returns {Promise<Object>} - объект с погодой
   */
  async getWeatherByCoords(lat, lon) {
    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      throw createError('Некорректные координаты', 400, 'INVALID_COORDS');
    }

    const cityCacheKey = `city:${lat.toFixed(2)},${lon.toFixed(2)}`;
    let cityLabel = await redis.get(cityCacheKey);

    if (!cityLabel) {
      cityLabel = await this.getCityName(lat, lon);
      if (cityLabel) {
        await redis.setex(cityCacheKey, 24 * 60 * 60, cityLabel);
      }
    }

    const cacheKey = `weather:coords:${lat},${lon}`; // Генерируем ключ для кэша

    // Проверяем кэш
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached); // Если данные есть в кэше, возвращаем их

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&daily=sunrise,sunset&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw createError('Не удалось получить погоду', 502, 'WEATHER_API_ERROR');
    }
    // Запрос к Open-Meteo
    const data = await response.json();
    const current = data.current; // Получаем данные о погоде
    const daily = data.daily; // Получаем данные о погоде

    // Получаем информацию о погоде из маппинга WEATHER_CODES (эмодзи и описание)
    const weatherInfo = getWeatherDisplay(
      current.weather_code,
      current.is_day,
      WEATHER_CODES
    );

    // Формируем результат
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

    // Сохраняем в кэш
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));

    return result;
  },
};

module.exports = weatherService;
