import { useGeolocation } from '../../../../shared/hooks';
import { getApiErrorDisplay } from '../../../../shared/lib';
import {
  BaseCard,
  Button,
  IconButton,
  Skeleton,
  SkeletonText,
  Text,
} from '../../../../shared/ui';
import {
  WEATHER_META_FIELDS,
  WEATHER_SUN_FIELDS,
} from '../config/weatherWidgetConfig';
import { useWeather } from '../model/useWeather';

import styles from './WeatherWidget.module.css';

/**
 * Отображает погоду в боковой панели.
 *
 * @returns {JSX.Element} Разметка виджета.
 */
export const WeatherWidget = () => {
  const { coords, isLoadingLocation, errorLocation, requestLocation } =
    useGeolocation();

  const { weather, isLoadingWeather, errorWeather, refetchWeather } =
    useWeather({ lat: coords?.latitude, lon: coords?.longitude });

  const handleRefresh = () => {
    // Повторный запрос не запускает, пока геолокация или погода ещё загружаются.
    if (isLoadingLocation || isLoadingWeather) return;

    // Сначала запрашивает координаты, если их ещё нет.
    if (!coords) {
      requestLocation();
      return;
    }

    refetchWeather?.();
  };

  if (isLoadingLocation || (isLoadingWeather && !weather)) {
    return (
      <BaseCard
        className={styles.widget}
        header={<Text variant="h4">Погода</Text>}
        content={
          <div className={styles.loading}>
            <Skeleton width="55%" height="42px" />
            <SkeletonText width="38%" />
          </div>
        }
      />
    );
  }

  if (errorWeather && !weather) {
    return (
      <BaseCard
        className={styles.widgetError}
        header={<Text variant="h4">Погода</Text>}
        content={
          <div className={styles.errorContent}>
            <Text variant="body2" className={styles.error}>
              {getApiErrorDisplay(
                errorWeather,
                'Не удалось получить данные о погоде. Попробуйте позже.'
              )}
            </Text>
            {errorLocation && (
              <Text variant="caption" className={styles.errorLocation}>
                {getApiErrorDisplay(
                  errorLocation,
                  'Не удалось получить геолокацию. Проверьте настройки вашего браузера.'
                )}
              </Text>
            )}
          </div>
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            className={styles.retry}
            onClick={handleRefresh}
            disabled={isLoadingLocation || isLoadingWeather}
          >
            Обновить
          </Button>
        }
      />
    );
  }

  return (
    <BaseCard
      className={styles.widget}
      header={
        <Text variant="h4" className={styles.title}>
          {weather?.city || 'Погода'}
        </Text>
      }
      content={
        <div className={styles.contentList}>
          <div className={styles.conditionLine}>
            <div className={styles.iconTemp}>
              <span className={styles.icon}>{weather?.icon || ''}</span>
              <Text variant="h2" className={styles.temp}>
                {typeof weather?.temp === 'number' && weather?.temp !== null
                  ? weather.temp > 0
                    ? `+${weather.temp}°`
                    : `${weather.temp}°`
                  : ''}
              </Text>
            </div>
            <Text variant="caption" className={styles.label}>
              {weather?.label || ''}
            </Text>
          </div>

          {weather &&
            WEATHER_META_FIELDS.map((row) => (
              <Text key={row.key} variant="caption" className={styles.metaLine}>
                {row.label}: {row.getValue(weather)}
              </Text>
            ))}

          <div className={styles.sunTimes}>
            {weather &&
              WEATHER_SUN_FIELDS.map((row) => (
                <Text
                  key={row.key}
                  variant="caption"
                  className={styles.sunText}
                >
                  {row.icon} {row.label}: {`в ${row.getValue(weather)}`}
                </Text>
              ))}
          </div>

          {errorLocation && !isLoadingLocation && (
            <div className={styles.errorLocationContainer}>
              <Text variant="caption" className={styles.errorLocation}>
                {getApiErrorDisplay(
                  errorLocation,
                  'Не удалось получить геолокацию. Проверьте настройки вашего браузера.'
                )}
              </Text>
              <IconButton
                icon="↻"
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingLocation || isLoadingWeather}
                ariaLabel="Повторить получение геолокации и обновить погоду"
              />
            </div>
          )}
        </div>
      }
    />
  );
};
