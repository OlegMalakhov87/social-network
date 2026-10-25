import { useCallback, useEffect, useRef, useState } from 'react';

/** Содержит коды и тексты ошибок геолокации. */
const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message:
      'Доступ к геолокации запрещён. Разрешите доступ в настройках браузера.',
  },
  POSITION_UNAVAILABLE: {
    code: 'POSITION_UNAVAILABLE',
    message:
      'Не удалось определить местоположение. Проверьте подключение и настройки устройства.',
  },
  TIMEOUT: {
    code: 'TIMEOUT',
    message: 'Время ожидания геолокации истекло. Попробуйте ещё раз.',
  },
  UNSUPPORTED: {
    code: 'UNSUPPORTED',
    message: 'Геолокация не поддерживается вашим браузером.',
  },
  UNKNOWN: {
    code: 'UNKNOWN',
    message: 'Произошла ошибка при получении геолокации.',
  },
};

/**
 * Возвращает описание ошибки геолокации.
 *
 * @param {Object} error - Ошибка геолокации браузера
 * @param {number} [error.code] - Числовой код ошибки
 * @returns {{ code: string, message: string }} Код и текст ошибки.
 */
const getGeolocationError = (error) => {
  switch (error?.code) {
    case 1:
      return GEOLOCATION_ERRORS.PERMISSION_DENIED;

    case 2:
      return GEOLOCATION_ERRORS.POSITION_UNAVAILABLE;

    case 3:
      return GEOLOCATION_ERRORS.TIMEOUT;

    default:
      return GEOLOCATION_ERRORS.UNKNOWN;
  }
};

/** Задаёт точность, время ожидания и срок актуальности координат. */
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 10 * 60 * 1000,
};

/**
 * Возвращает координаты пользователя из браузера.
 *
 * @returns {{
 *   coords: { latitude: number, longitude: number }|null,
 *   isLoadingLocation: boolean,
 *   errorLocation: { code: string, message: string }|null,
 *   requestLocation: Function
 * }} Координаты, состояние загрузки и повторный запрос.
 */
export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  // Отличает актуальный запрос от устаревшего.
  const requestIdRef = useRef(0);

  /**
   * Запрашивает текущие координаты.
   *
   * @returns {void}
   */
  const requestLocation = useCallback(() => {
    const requestId = ++requestIdRef.current;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError(GEOLOCATION_ERRORS.UNSUPPORTED);
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== requestIdRef.current) return;

        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setStatus('success');
        setError(null);
      },
      (geoError) => {
        if (requestId !== requestIdRef.current) return;

        setError(getGeolocationError(geoError));
        setStatus('error');
      },
      GEOLOCATION_OPTIONS
    );
  }, []);

  useEffect(() => {
    requestLocation();

    return () => {
      // Игнорирует ответ после размонтирования.
      requestIdRef.current += 1;
    };
  }, [requestLocation]);

  return {
    coords,
    isLoadingLocation: status === 'loading',
    errorLocation: error,
    requestLocation,
  };
};
