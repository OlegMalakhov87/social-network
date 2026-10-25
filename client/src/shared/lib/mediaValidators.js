import { formatDuration } from '../utils';

/**
 * Проверяет длительность, разрешение и соотношение сторон через средства браузера.
 * Возвращает null при успехе или строку с ошибкой.
 */

/**
 * Проверяет длительность аудио или видео.
 *
 * @param {number} maxSeconds - Максимальная длительность в секундах
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает файл и возвращает промис с текстом ошибки или null.
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
              `Длительность не должна превышать ${formatDuration(maxSeconds)}`
      );
    };

    media.onerror = () => {
      URL.revokeObjectURL(media.src);
      resolve('Не удалось прочитать метаданные файла');
    };
  });
};

/**
 * Проверяет минимальное разрешение изображения.
 *
 * @param {number} minWidth - Минимальная ширина в пикселях
 * @param {number} minHeight - Минимальная высота в пикселях
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает файл и возвращает промис с текстом ошибки или null.
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
 * Проверяет соотношение сторон изображения.
 *
 * @param {number} ratio - Ожидаемое соотношение ширины к высоте
 * @param {number} [tolerance=0.1] - Допустимое отклонение
 * @param {string} [message] - Текст ошибки
 * @returns {Function} Принимает файл и возвращает промис с текстом ошибки или null.
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
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) {
        resolve('Не удалось прочитать размеры изображения');
        return;
      }
      const actualRatio = w / h;
      const relativeDiff =
        ratio === 1
          ? Math.abs(w - h) / Math.max(w, h)
          : Math.abs(actualRatio - ratio) / ratio;
      const isValid =
        ratio === 1
          ? relativeDiff <= tolerance
          : Math.abs(actualRatio - ratio) <= tolerance;
      resolve(
        isValid
          ? null
          : message ||
              (ratio === 1
                ? 'Изображение должно быть примерно квадратным'
                : `Соотношение сторон должно быть примерно ${ratio.toFixed(2)}`)
      );
    };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve('Не удалось прочитать изображение');
      };
    });
  };
