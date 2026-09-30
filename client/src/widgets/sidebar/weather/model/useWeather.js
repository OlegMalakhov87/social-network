import { useEffect } from 'react';
import { useAbortableRequest } from '../../../../shared/hooks';
import { fetchWeatherApi } from '../api/weatherApi';

/** Интервал обновления погоды в миллисекундах. */
const WEATHER_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 минут

/**
 * Хук для получения погоды по адресу.
 *
 * @param {Object} params - параметры запроса
 * @returns {Object} - { weather, isLoading, error, refetch }
 */
export const useWeather = (params) => {
  const { lat, lon } = params;
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

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
    deps: [lat, lon],
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
