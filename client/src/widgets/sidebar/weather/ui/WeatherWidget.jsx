import { useGeolocation } from '../../../../shared/hooks';
import { getApiErrorDisplay } from '../../../../shared/lib';
import {
  BaseCard,
  Button,
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
 * Виджет погоды в сайдбаре.
 */
export const WeatherWidget = () => {
  /**  Хук для получения геолокации пользователя. */
  const { coords, isLoadingLocation, errorLocation, requestLocation } =
    useGeolocation();

  /** Хук для получения данных о погоде. */
  const { weather, isLoadingWeather, errorWeather, refetchWeather } =
    useWeather({ lat: coords?.latitude, lon: coords?.longitude });

  /** Обработчик обновления данных. */
  const handleRefresh = () => {
    if (isLoadingLocation || isLoadingWeather) return;

    if (!coords) {
      requestLocation();
      return;
    }

    refetchWeather?.();
  };

  /** Если данные загружаются, отображаем загрузочный скелетон. */
  if (isLoadingWeather && !weather) {
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

  /** Если есть ошибка и данные не загружены, отображаем сообщение об ошибке. */
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

  /** Если данные загружены, отображаем виджет погоды. */
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
              <span className={styles.icon}>{weather?.icon}</span>
              <Text variant="h2" className={styles.temp}>
                {weather?.temp
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

          {/** Отображаем мета информацию о погоде. */}
          {weather &&
            WEATHER_META_FIELDS.map((row) => (
              <Text key={row.key} variant="caption" className={styles.metaLine}>
                {row.label}: {row.getValue(weather)}
              </Text>
            ))}

          {/** Отображаем информацию о солнце. */}
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
    />
  );
};
