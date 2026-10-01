import { useEffect } from 'react';
import { useAbortableRequest } from '../../../../shared/hooks';
import { fetchWeatherApi } from '../api/weatherApi';

  /** Интервал обновления погоды в миллисекундах. */
  const WEATHER_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Хук для получения погоды по координатам пользователя из браузера.
 *
 * @param {Object} params - параметры запроса
 * @param {number} params.lat - широта
 * @param {number} params.lon - долгота
 * @returns {Object} - { weather, isLoadingWeather, errorWeather, refetchWeather }
 */
export const useWeather = (params) => {
  const { lat, lon } = params;

  /** Проверяем, что координаты валидны. */
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  /** Запрос данных о погоде. */
  const {
    data: weather,
    isLoading,
    error,
    execute: refetch,
  } = useAbortableRequest({
    fetcher: async (signal) => {
      if (!hasCoords) return null;
      return await fetchWeatherApi(
        {
          lat,
          lon,
        },
        signal
      );
    },
    deps: [hasCoords, lat, lon],
    options: {
      autoFetch: hasCoords,
      initialData: null,
    },
  });

  /** Установка интервала обновления погоды. */
  useEffect(() => {
    if (!hasCoords) return;
    const intervalId = setInterval(
      () => refetch?.(),
      WEATHER_REFRESH_INTERVAL_MS
    );
    return () => clearInterval(intervalId);
  }, [hasCoords, refetch]);

  return {
    weather,
    isLoadingWeather: isLoading,
    errorWeather: error,
    refetchWeather: refetch,
  };
};
