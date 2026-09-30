import { api } from '../../../../shared/api';
import { WeatherSchema } from '../model/weatherSchema';

/**
 * Получить погоду по адресу пользователя.
 *
 * @param {Object} params - параметры запроса
 * @param {AbortSignal} signal - сигнал отмены запроса
 * @returns {Promise<Object>} - данные о погоде
 */
export const fetchWeatherApi = async (params, signal) => {
  const response = await api.get('/widgets/weather', {
    params,
    signal,
  });

  return WeatherSchema.parse(response.data);
};
