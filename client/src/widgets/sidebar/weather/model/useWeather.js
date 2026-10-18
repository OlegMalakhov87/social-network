import { useEffect, useState } from 'react';
import { useAbortableRequest } from '../../../../shared/hooks';
import { fetchWeatherApi } from '../api/weatherApi';

/** Интервал обновления погоды в миллисекундах. */
const WEATHER_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

/** Базовая задержка повторных запросов погоды в миллисекундах. */
const RETRY_BASE_DELAY_MS = 5 * 60 * 1000;
/** Максимальная задержка повторных запросов погоды в миллисекундах. */
const RETRY_MAX_DELAY_MS = 30 * 60 * 1000;

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
  const [retryCount, setRetryCount] = useState(0);

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

  /** Сброс retryCount при смене координат. */
  useEffect(() => {
    setRetryCount(0);
  }, [lat, lon]);

  /** Сброс retryCount при успешном запросе. */
  useEffect(() => {
    if (weather) {
      setRetryCount(0);
    }
  }, [weather]);

  /** Установка интервала обновления погоды. */
  useEffect(() => {
    if (!hasCoords) return;
    const intervalId = setInterval(
      () => refetch?.(),
      WEATHER_REFRESH_INTERVAL_MS
    );
    return () => clearInterval(intervalId);
  }, [hasCoords, refetch]);

  /** Установка интервала повторных запросов погоды при ошибке. */
  useEffect(() => {
    if (!hasCoords || !error) return;

    const retryDelay = Math.min(
      RETRY_BASE_DELAY_MS * 2 ** retryCount,
      RETRY_MAX_DELAY_MS
    );

    const retryTimeout = setTimeout(() => {
      setRetryCount((c) => c + 1);
      refetch();
    }, retryDelay);

    return () => clearTimeout(retryTimeout);
  }, [hasCoords, error, refetch, retryCount]);

  return {
    weather,
    isLoadingWeather: isLoading,
    errorWeather: error,
    refetchWeather: refetch,
  };
};
