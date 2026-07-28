import { formatTime } from '../utils/formatDuration';

/**
 * Специфичные валидаторы для медиа-файлов (аудио, видео, изображения).
 * Используют HTML5 API для чтения метаданных (длительность, разрешение).
 */

/**
 * Валидатор длительности аудио/видео.
 * @param {number} maxSeconds - максимальная длительность в секундах
 * @param {string} [message]
 * @returns {Function} - (file) => Promise<string|null>
 */
export const maxDuration = (maxSeconds, message) => (file) => {
  if (!file) return Promise.resolve(null);

  return new Promise((resolve) => {
    const isVideo = file.type.startsWith('video/');
    const media = isVideo
      ? document.createElement('video')
      : document.createElement('audio');

    media.preload = 'metadata';
    media.src = URL.createObjectURL(file);

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(media.src);
      const isValid = media.duration <= maxSeconds;
      resolve(
        isValid
          ? null
          : message ||
              `Длительность не должна превышать ${formatTime(maxSeconds)}`
      );
    };

    media.onerror = () => {
      URL.revokeObjectURL(media.src);
      resolve('Не удалось прочитать метаданные файла');
    };
  });
};

/**
 * Валидатор минимального разрешения изображения.
 * @param {number} minWidth - минимальная ширина в пикселях
 * @param {number} minHeight - минимальная высота в пикселях
 * @param {string} [message]
 * @returns {Function} - (file) => Promise<string|null>
 */
export const minImageResolution = (minWidth, minHeight, message) => (file) => {
  if (!file || !file.type.startsWith('image/')) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const isValid = img.width >= minWidth && img.height >= minHeight;
      resolve(
        isValid
          ? null
          : message || `Минимальное разрешение: ${minWidth}x${minHeight}px`
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve('Не удалось прочитать изображение');
    };
  });
};

/**
 * Валидатор соотношения сторон изображения.
 * @param {number} ratio - ожидаемое соотношение (например, 1 для квадрата, 16/9 для видео)
 * @param {number} [tolerance=0.1] - допустимое отклонение
 * @param {string} [message]
 * @returns {Function} - (file) => Promise<string|null>
 */
export const aspectRatio =
  (ratio, tolerance = 0.1, message) =>
  (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const actualRatio = img.width / img.height;
        const isValid = Math.abs(actualRatio - ratio) <= tolerance;
        resolve(
          isValid
            ? null
            : message ||
                `Соотношение сторон должно быть примерно ${ratio.toFixed(2)}`
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve('Не удалось прочитать изображение');
      };
    });
  };
