import { useCallback, useEffect, useRef, useState } from 'react';

/** Мапа с константами ошибок геолокации. */
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

/** Вспомогательная функция для получения ошибки геолокации. */
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

/** Константа с опциями геолокации. */
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 10 * 60 * 1000,
};

/** Хук для получения координат пользователя из браузера. */
export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  /** Счётчик запросов. */
  const requestIdRef = useRef(0);

  /** Запрос геолокации. */
  const requestLocation = useCallback(() => {
    const requestId = ++requestIdRef.current;

    /** Проверка доступности геолокации. */
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError(GEOLOCATION_ERRORS.UNSUPPORTED);
      setStatus('error');
      return;
    }

    /** Установка статуса загрузки. */
    setStatus('loading');
    setError(null);

    /** Запрос геолокации. */
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId !== requestIdRef.current) return;

        /** Установка координат. */
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        /** Установка статуса успешного запроса. */
        setStatus('success');
        setError(null);
      },
      (geoError) => {
        if (requestId !== requestIdRef.current) return;

        /** Установка ошибки. */
        setError(getGeolocationError(geoError));
        setStatus('error');
      },
      GEOLOCATION_OPTIONS
    );
  }, []);

  /** Запрос геолокации при монтировании. */
  useEffect(() => {
    requestLocation();

    return () => {
      requestIdRef.current += 1;
    };
  }, [requestLocation]);

  /** Возвращаем данные геолокации. */
  return {
    coords,
    isLoadingLocation: status === 'loading',
    errorLocation: error,
    requestLocation,
  };
};
