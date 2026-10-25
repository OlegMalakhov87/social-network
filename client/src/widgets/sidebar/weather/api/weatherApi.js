import { api } from '../../../../shared/api';
import { WeatherSchema } from '../model/weatherSchema';

/**
 * Запрашивает погоду по координатам.
 *
 * @param {Object} params - Параметры запроса
 * @param {number} params.lat - Широта
 * @param {number} params.lon - Долгота
 * @param {AbortSignal} signal - Сигнал отмены запроса
 * @returns {Promise<Object>} Данные о погоде.
 */
export const fetchWeatherApi = async (params, signal) => {
  const response = await api.get('/widgets/weather', {
    params,
    signal,
  });

  return WeatherSchema.parse(response.data);
};
