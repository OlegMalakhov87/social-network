import { useEffect, useState } from 'react';

import { useAbortableRequest } from '../../../../shared/hooks';
import { fetchWeatherApi } from '../api/weatherApi';

/** Задаёт интервал обновления погоды в миллисекундах. */
const WEATHER_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

/** Задаёт базовую задержку повторного запроса погоды в миллисекундах. */
const RETRY_BASE_DELAY_MS = 5 * 60 * 1000;
/** Задаёт верхний предел задержки повторного запроса погоды в миллисекундах. */
const RETRY_MAX_DELAY_MS = 30 * 60 * 1000;

/**
 * Возвращает погоду по координатам.
 *
 * @param {Object} params - Параметры запроса
 * @param {number} [params.lat] - Широта
 * @param {number} [params.lon] - Долгота
 * @returns {{weather: Object|null, isLoadingWeather: boolean, errorWeather: Error|null, refetchWeather: Function}} Состояние погоды.
 */
export const useWeather = (params) => {
  const { lat, lon } = params;
  const [retryCount, setRetryCount] = useState(0);

  // Считает координаты пригодными, только если оба числа конечные.
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  const {
    data: weather,
    isLoading,
    error,
    execute: refetch,
  } = useAbortableRequest({
    /**
     * Запрашивает погоду, если координаты пригодны.
     *
     * @param {AbortSignal} signal - Сигнал отмены запроса
     * @returns {Promise<Object|null>} Данные о погоде.
     */
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

  useEffect(() => {
    setRetryCount(0);
  }, [lat, lon]);

  useEffect(() => {
    if (weather) {
      setRetryCount(0);
    }
  }, [weather]);

  useEffect(() => {
    if (!hasCoords) return;
    const intervalId = setInterval(
      () => refetch?.(),
      WEATHER_REFRESH_INTERVAL_MS
    );
    return () => clearInterval(intervalId);
  }, [hasCoords, refetch]);

  // Удваивает паузу между повторами и ограничивает её верхним пределом.
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
